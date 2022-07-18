import {
  Erc20Transfer as GnosisErc20Transfer,
  Erc721Transfer as GnosisErc721Transfer,
  NativeCoinTransfer as GnosisNativeCoinTransfer,
  Transaction as GnosisTransaction,
  Transfer as GnosisTransfer,
  TransferInfo as GnosisTransferInfo,
} from '@gnosis.pm/safe-react-gateway-sdk';
import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import { AbstractDAOClient, GnosisSafeClient } from '../../client';
import {
  AssetType,
  InvalidError,
  PaginationParam,
  ProposalId,
  ProposalState,
  Transaction,
  TransactionStatus,
  TransactionType,
  TransferInfo,
  zDAOAssets,
  zDAOProperties,
} from '../../types';
import { errorMessageForError, getSigner } from '../../utilities';
import { SnapshotClient } from '../snapshot';
import {
  CreateSnapshotProposalParams,
  SnapshotConfig,
  SnapshotProposal,
  SnapshotVote,
  SnapshotZDAO,
  zDAOOptions,
} from '../types';
import GlobalClient from './GlobalClient';
import ProposalClient from './ProposalClient';

class DAOClient
  extends AbstractDAOClient<SnapshotVote, SnapshotProposal>
  implements SnapshotZDAO
{
  private readonly _config: SnapshotConfig;
  protected readonly _snapshotClient: SnapshotClient;
  protected readonly _zDAOOptions: zDAOOptions;
  private readonly _options: any;

  private constructor(
    config: SnapshotConfig,
    properties: zDAOProperties & zDAOOptions,
    options: any
  ) {
    super(
      properties,
      new GnosisSafeClient(config.gnosisSafe, config.ipfsGateway)
    );
    this._config = config;
    this._zDAOOptions = cloneDeep(properties);
    this._options = options;

    this._snapshotClient = new SnapshotClient(config.snapshot);
  }

  get ens() {
    return this._zDAOOptions.ens;
  }

  static async createInstance(
    config: SnapshotConfig,
    properties: zDAOProperties & zDAOOptions,
    options: any
  ): Promise<SnapshotZDAO> {
    if (options === undefined) {
      const snapshotClient = new SnapshotClient(config.snapshot);
      const strategies = await snapshotClient.getSpaceStrategies(
        properties.ens
      );
      options = { strategies };
    }

    const zDAO = new DAOClient(config, properties, options);
    return zDAO;
  }

  async listAssets(): Promise<zDAOAssets> {
    const balances = await this._gnosisSafeClient.listAssets(
      this.gnosisSafe,
      this.network.toString()
    );

    const collectibles = await this._gnosisSafeClient.listCollectibles(
      this.gnosisSafe,
      this.network.toString()
    );

    return {
      amountInUSD: Number(balances.fiatTotal),
      coins: balances.items.map((item: any) => ({
        type: item.tokenInfo.type as string as AssetType,
        address: item.tokenInfo.address,
        decimals: item.tokenInfo.decimals,
        symbol: item.tokenInfo.symbol,
        name: item.tokenInfo.name,
        logoUri: item.tokenInfo.logoUri ?? undefined,
        amount: item.balance,
        amountInUSD: Number(item.fiatBalance),
      })),
      collectibles: collectibles.map((item: any) => ({
        address: item.address,
        tokenName: item.tokenName,
        tokenSymbol: item.tokenSymbol,
        id: item.id,
        logoUri: item.logoUri,
        name: item.name,
        description: item.description,
        imageUri: item.imageUri,
        metadata: item.metadata,
      })),
    };
  }

  async listTransactions(): Promise<Transaction[]> {
    const transactions: GnosisTransaction[] =
      await this._gnosisSafeClient.listTransactions(
        this.gnosisSafe,
        this.network.toString()
      );

    const mapToTransferInfo = (info: GnosisTransferInfo): TransferInfo => {
      if ((info.type as string) === AssetType.ERC20) {
        const typedInfo = info as GnosisErc20Transfer;
        return {
          type: AssetType.ERC20,
          tokenAddress: typedInfo.tokenAddress,
          tokenName: typedInfo.tokenName ?? undefined,
          tokenSymbol: typedInfo.tokenSymbol ?? undefined,
          logoUri: typedInfo.logoUri ?? undefined,
          decimals: typedInfo.decimals ?? undefined,
          value: typedInfo.value,
        };
      } else if ((info.type as string) === AssetType.ERC721) {
        const typedInfo = info as GnosisErc721Transfer;
        return {
          type: AssetType.ERC721,
          tokenAddress: typedInfo.tokenAddress,
          tokenId: typedInfo.tokenId,
          tokenName: typedInfo.tokenName ?? undefined,
          tokenSymbol: typedInfo.tokenSymbol ?? undefined,
          logoUri: typedInfo.logoUri ?? undefined,
        };
      } else {
        // AssetType.NATIVE_COIN
        const typedInfo = info as GnosisNativeCoinTransfer;
        return {
          type: AssetType.NATIVE_TOKEN,
          value: typedInfo.value,
        };
      }
    };

    return transactions.map((tx: GnosisTransaction) => {
      const txInfo = tx.transaction.txInfo as GnosisTransfer;
      return {
        type:
          txInfo.direction === 'INCOMING'
            ? TransactionType.RECEIVED
            : TransactionType.SENT,
        asset: mapToTransferInfo(txInfo.transferInfo),
        from: txInfo.sender.value,
        to: txInfo.recipient.value,
        created: new Date(tx.transaction.timestamp),
        status: tx.transaction.txStatus as string as TransactionStatus,
      };
    });
  }

  private mapState(state: string): ProposalState {
    if (state === 'pending') {
      return ProposalState.PENDING;
    } else if (state === 'active') {
      return ProposalState.ACTIVE;
    }
    return ProposalState.CLOSED;
  }

  async listProposals(
    pagination?: PaginationParam
  ): Promise<SnapshotProposal[]> {
    const limit = 3000;
    let from = pagination?.from ?? 0;
    let count = pagination?.count ?? limit;
    let numberOfResults = limit;
    const snapshotProposals = [];

    // get the list of proposals
    while (numberOfResults === limit) {
      const results = await this._snapshotClient.listProposals(
        this.ens,
        this.network.toString(),
        from,
        count >= limit ? limit : count
      );

      snapshotProposals.push(...results);

      from += results.length;
      count -= results.length;
      numberOfResults = results.length;
    }

    // create all instances
    const promises: Promise<SnapshotProposal>[] = snapshotProposals.map(
      (proposal): Promise<SnapshotProposal> =>
        ProposalClient.createInstance(
          this,
          this._snapshotClient,
          this._gnosisSafeClient,
          {
            id: proposal.id,
            createdBy: proposal.author,
            title: proposal.title,
            body: proposal.body ?? '',
            ipfs: proposal.ipfs,
            choices: proposal.choices,
            created: proposal.created,
            start: proposal.start,
            end: proposal.end,
            state: this.mapState(proposal.state),
            snapshot: Number(proposal.snapshot),
            scores: proposal.scores.map((score) => score.toString()),
            voters: proposal.votes,
          },
          {
            strategies: this._options.strategies,
            scores_state: proposal.scores_state,
          }
        )
    );

    return await Promise.all(promises);
  }

  async getProposal(id: ProposalId): Promise<SnapshotProposal> {
    await this._snapshotClient.forceUpdateScoresAndVotes(id);

    const proposal = await this._snapshotClient.getProposal({
      spaceId: this.ens,
      network: this.network.toString(),
      strategies: this._options.strategies,
      proposalId: id,
    });

    return await ProposalClient.createInstance(
      this,
      this._snapshotClient,
      this._gnosisSafeClient,
      {
        id: proposal.id,
        createdBy: proposal.author,
        title: proposal.title,
        body: proposal.body ?? '',
        ipfs: proposal.ipfs,
        choices: proposal.choices,
        created: proposal.created,
        start: proposal.start,
        end: proposal.end,
        state: this.mapState(proposal.state),
        snapshot: Number(proposal.snapshot),
        scores: proposal.scores.map((score) => score.toString()),
        voters: proposal.votes,
      },
      {
        strategies: this._options.strategies,
        scores_state: proposal.scores_state,
      }
    );
  }

  async createProposal(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: CreateSnapshotProposalParams
  ): Promise<ProposalId> {
    const duration = this.duration > 0 ? this.duration : payload.duration ?? 0;
    if (!duration) {
      throw new InvalidError(errorMessageForError('invalid-proposal-duration'));
    }

    const snapshot = await GlobalClient.etherRpcProvider.getBlockNumber();

    const signer = getSigner(provider, account);
    const accountAddress = account ? account : await signer.getAddress();
    const { id: proposalId } = await this._snapshotClient.createProposal(
      provider,
      accountAddress,
      {
        spaceId: this.ens,
        title: payload.title,
        body: payload.body ?? '',
        choices: payload.choices,
        duration,
        snapshot,
        network: this.network.toString(),
        strategies: this._options.strategies,
        token: this.votingToken,
        transfer: payload.transfer && {
          sender: this.gnosisSafe,
          recipient: payload.transfer.recipient,
          token: payload.transfer.token,
          decimals: payload.transfer.decimals,
          symbol: payload.transfer.symbol,
          amount: payload.transfer.amount,
        },
      }
    );

    return proposalId;
  }
}

export default DAOClient;
