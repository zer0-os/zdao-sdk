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
  CreateProposalParams,
  NotImplementedError,
  PaginationParam,
  Proposal,
  ProposalId,
  ProposalState,
  Transaction,
  TransactionStatus,
  TransactionType,
  TransferInfo,
  zDAO,
  zDAOAssets,
  zDAOProperties,
} from '../../types';
import { errorMessageForError } from '../../utilities';
import { SnapshotClient } from '../snapshot';
import { SnapshotProposal } from '../snapshot/types';
import { Config, CreateProposalParamsOptions, ZDAOOptions } from '../types';
import GlobalClient from './GlobalClient';
import ProposalClient from './ProposalClient';

class DAOClient extends AbstractDAOClient {
  private readonly _config: Config;
  protected readonly _snapshotClient: SnapshotClient;
  protected readonly _properties: zDAOProperties;
  private readonly _options: any;

  private constructor(
    config: Config,
    properties: zDAOProperties,
    options: any
  ) {
    super(
      properties,
      new GnosisSafeClient(config.gnosisSafe, config.ipfsGateway)
    );
    this._config = config;
    this._properties = cloneDeep(properties);
    this._options = options;

    this._snapshotClient = new SnapshotClient(config.snapshot);
  }

  static async createInstance(
    config: Config,
    properties: zDAOProperties,
    options: any
  ): Promise<zDAO> {
    if (options === undefined) {
      const snapshotClient = new SnapshotClient(config.snapshot);
      const strategies = await snapshotClient.getSpaceStrategies(
        (properties.options as unknown as ZDAOOptions).ens
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
    } else if (state === 'closed') {
      return ProposalState.EXECUTED;
    }
    return ProposalState.FAILED;
  }

  async listProposals(pagination?: PaginationParam): Promise<Proposal[]> {
    const limit = 3000;
    let from = pagination?.from ?? 0;
    let count = pagination?.count ?? limit;
    let numberOfResults = limit;
    const snapshotProposals: SnapshotProposal[] = [];

    // get the list of proposals
    while (numberOfResults === limit) {
      const results: SnapshotProposal[] =
        await this._snapshotClient.listProposals(
          (this.options as unknown as ZDAOOptions).ens,
          this.network.toString(),
          from,
          count >= limit ? limit : count
        );

      snapshotProposals.push(...results);

      from += results.length;
      count -= results.length;
      numberOfResults = results.length;
    }

    // The scores in voted proposal was updated immediately after voting,
    // so we don't need to call `updateScore`.
    // // update the immediate scores
    // const snapshotPromises: Promise<SnapshotProposal>[] = snapshotProposals.map(
    //   (proposal: SnapshotProposal) =>
    //     this._snapshotClient.updateScores(proposal, {
    //       spaceId: (this.options as unknown as ZDAOOptions).ens,
    //       network: this.network.toString(),
    //       strategies: this._options.strategies,
    //     })
    // );
    // const proposals = await Promise.all(snapshotPromises);

    // create all instances
    const promises: Promise<Proposal>[] = snapshotProposals.map(
      (proposal: SnapshotProposal): Promise<Proposal> =>
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

  async getProposal(id: ProposalId): Promise<Proposal> {
    await this._snapshotClient.forceUpdateScoresAndVotes(id);

    const proposal: SnapshotProposal = await this._snapshotClient.getProposal({
      spaceId: (this.options as unknown as ZDAOOptions).ens,
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
    account: string,
    payload: CreateProposalParams
  ): Promise<ProposalId> {
    if (!this.duration) {
      throw new Error(errorMessageForError('invalid-proposal-duration'));
    }

    const snapshot = await GlobalClient.etherRpcProvider.getBlockNumber();

    const { id: proposalId } = await this._snapshotClient.createProposal(
      provider,
      account,
      {
        spaceId: (this.options as unknown as ZDAOOptions).ens,
        title: payload.title,
        body: payload.body ?? '',
        choices: (payload.options as unknown as CreateProposalParamsOptions)
          .choices,
        duration: this.duration,
        snapshot,
        network: this.network.toString(),
        strategies: this._options.strategies,
        token: this.votingToken,
        transfer: payload.transfer && {
          abi: payload.transfer.abi,
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

  isCheckPointed(_: string): Promise<boolean> {
    throw new NotImplementedError();
  }

  syncState(_: ethers.Signer, _2: string): Promise<void> {
    throw new NotImplementedError();
  }
}

export default DAOClient;
