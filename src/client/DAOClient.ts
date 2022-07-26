import {
  Erc20Transfer as GnosisErc20Transfer,
  Erc721Transfer as GnosisErc721Transfer,
  NativeCoinTransfer as GnosisNativeCoinTransfer,
  Transaction as GnosisTransaction,
  Transfer as GnosisTransfer,
  TransferInfo as GnosisTransferInfo,
} from '@gnosis.pm/safe-react-gateway-sdk';
import { BigNumber, ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import ERC20Abi from '../config/constants/abi/ERC20.json';
import GnosisSafeClient from '../gnosis-safe';
import SnapshotClient from '../snapshot-io';
import { SnapshotProposal } from '../snapshot-io/types';
import {
  AssetType,
  Config,
  CreateProposalParams,
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
} from '../types';
import { getDecimalAmount, getFullDisplayBalance } from '../utilities';
import { errorMessageForError } from '../utilities/messages';
import ProposalClient from './ProposalClient';

class DAOClient implements zDAO {
  private readonly _config: Config;
  protected readonly _snapshotClient: SnapshotClient;
  protected readonly _gnosisSafeClient: GnosisSafeClient;
  protected readonly _properties: zDAOProperties;
  private readonly _options: any;

  private constructor(
    config: Config,
    properties: zDAOProperties,
    options: any
  ) {
    this._config = config;
    this._properties = cloneDeep(properties);
    this._options = options;

    this._snapshotClient = new SnapshotClient(config.snapshot);
    this._gnosisSafeClient = new GnosisSafeClient(config.gnosisSafe);
  }

  get id() {
    return this._properties.id;
  }

  get ens() {
    return this._properties.ens;
  }

  get zNAs() {
    return this._properties.zNAs;
  }

  get title() {
    return this._properties.title;
  }

  get creator() {
    return this._properties.creator;
  }

  get network() {
    return this._properties.network;
  }

  get duration() {
    return this._properties.duration;
  }

  get safeAddress() {
    return this._properties.safeAddress;
  }

  get votingToken() {
    return this._properties.votingToken;
  }

  get amount() {
    return this._properties.amount;
  }

  get totalSupplyOfVotingToken() {
    return this._properties.totalSupplyOfVotingToken;
  }

  get votingThreshold() {
    return this._properties.votingThreshold;
  }

  get minimumVotingParticipants() {
    return this._properties.minimumVotingParticipants;
  }

  get minimumTotalVotingTokens() {
    return this._properties.minimumTotalVotingTokens;
  }

  get isRelativeMajority() {
    return this._properties.isRelativeMajority;
  }

  static async createInstance(
    config: Config,
    properties: zDAOProperties,
    options: any
  ): Promise<zDAO> {
    if (options === undefined) {
      const snapshotClient = new SnapshotClient(config.snapshot);
      const { strategies, threshold, duration, delay, quorum } =
        await snapshotClient.getSpaceOptions(properties.ens);
      options = { strategies, delay };
      properties.duration = duration;
      properties.amount = threshold
        ? getDecimalAmount(
            BigNumber.from(threshold),
            properties.votingToken.decimals
          ).toString()
        : '0';
      properties.minimumTotalVotingTokens = quorum
        ? getDecimalAmount(
            BigNumber.from(quorum),
            properties.votingToken.decimals
          ).toString()
        : '0';
      properties.votingThreshold =
        properties.totalSupplyOfVotingToken === '0'
          ? 0
          : BigNumber.from(properties.minimumTotalVotingTokens)
              .mul(10000)
              .div(properties.totalSupplyOfVotingToken)
              .toNumber();
    }

    const zDAO = new DAOClient(config, properties, options);
    return zDAO;
  }

  async listAssets(): Promise<zDAOAssets> {
    const results = await Promise.all([
      this._gnosisSafeClient.listAssets(this.safeAddress, this.network),
      this._gnosisSafeClient.listCollectibles(this.safeAddress, this.network),
    ]);
    const balances = results[0];
    const collectibles = results[1];

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
        metadataUri: item.uri,
      })),
    };
  }

  async listTransactions(): Promise<Transaction[]> {
    const transactions: GnosisTransaction[] =
      await this._gnosisSafeClient.listTransactions(
        this.safeAddress,
        this.network
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
          this.ens,
          this.network,
          from,
          count >= limit ? limit : count
        );

      snapshotProposals.push(...results);

      from += results.length;
      count -= results.length;
      numberOfResults = results.length;
    }

    // create all instances
    const promises: Promise<Proposal>[] = snapshotProposals.map(
      (proposal: SnapshotProposal): Promise<Proposal> =>
        ProposalClient.createInstance(
          this,
          this._snapshotClient,
          this._gnosisSafeClient,
          {
            id: proposal.id,
            type: proposal.type,
            author: proposal.author,
            title: proposal.title,
            body: proposal.body ?? '',
            ipfs: proposal.ipfs,
            choices: proposal.choices,
            created: proposal.created,
            start: proposal.start,
            end: proposal.end,
            state: this.mapState(proposal.state),
            network: proposal.network,
            snapshot: Number(proposal.snapshot),
            scores: proposal.scores,
            votes: proposal.votes,
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
      spaceId: this.ens,
      network: this.network,
      strategies: this._options.strategies,
      proposalId: id,
    });

    return await ProposalClient.createInstance(
      this,
      this._snapshotClient,
      this._gnosisSafeClient,
      {
        id: proposal.id,
        type: proposal.type,
        author: proposal.author,
        title: proposal.title,
        body: proposal.body ?? '',
        ipfs: proposal.ipfs,
        choices: proposal.choices,
        created: proposal.created,
        start: proposal.start,
        end: proposal.end,
        state: this.mapState(proposal.state),
        network: proposal.network,
        snapshot: Number(proposal.snapshot),
        scores: proposal.scores,
        votes: proposal.votes,
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
    if (!this.duration && !payload.duration) {
      throw new Error(errorMessageForError('invalid-proposal-duration'));
    }

    // signer should have valid amount of voting token on Ethereum
    const contract = new ethers.Contract(
      this.votingToken.token,
      ERC20Abi,
      provider
    );

    const balance = await contract.balanceOf(account);
    if (balance.lt(this.amount)) {
      throw new Error(
        errorMessageForError('should-hold-token', {
          amount: getFullDisplayBalance(
            BigNumber.from(this.amount),
            this.votingToken.decimals
          ),
        })
      );
    }

    const duration = this.duration ?? payload.duration;
    const { id: proposalId } = await this._snapshotClient.createProposal(
      provider,
      account,
      {
        spaceId: this.ens,
        title: payload.title,
        body: payload.body ?? '',
        choices: payload.choices,
        delay: this._options.delay,
        duration: duration!,
        snapshot: Number(payload.snapshot),
        network: this.network,
        strategies: this._options.strategies,
        token: this.votingToken,
        transfer: payload.transfer && {
          sender: this.safeAddress,
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
