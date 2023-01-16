import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import {
  Erc20Transfer as GnosisErc20Transfer,
  Erc721Transfer as GnosisErc721Transfer,
  NativeCoinTransfer as GnosisNativeCoinTransfer,
  Transaction as GnosisTransaction,
  Transfer as GnosisTransfer,
  TransferInfo as GnosisTransferInfo,
} from '@gnosis.pm/safe-react-gateway-sdk';
import { cloneDeep } from 'lodash';

import { DEFAULT_PROPOSAL_CHOICES } from '../config';
import ERC20Abi from '../config/abi/ERC20.json';
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
  zDAOCoins,
  zDAOCollectibles,
  zDAOProperties,
} from '../types';
import {
  getDecimalAmount,
  getFullDisplayBalance,
  getSigner,
} from '../utilities';
import { errorMessageForError } from '../utilities/messages';
import ProposalClient from './ProposalClient';

class DAOClient implements zDAO {
  protected readonly snapshotClient: SnapshotClient;
  protected readonly gnosisSafeClient: GnosisSafeClient;
  protected readonly properties: zDAOProperties;
  private readonly options: any;

  private constructor(
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: zDAOProperties,
    options: any
  ) {
    this.properties = cloneDeep(properties);
    this.options = options;

    this.snapshotClient = snapshotClient;
    this.gnosisSafeClient = gnosisSafeClient;
  }

  get id() {
    return this.properties.id;
  }

  get ens() {
    return this.properties.ens;
  }

  get zNAs() {
    return this.properties.zNAs;
  }

  get title() {
    return this.properties.title;
  }

  get creator() {
    return this.properties.creator;
  }

  get network() {
    return this.properties.network;
  }

  get duration() {
    return this.properties.duration;
  }

  get safeAddress() {
    return this.properties.safeAddress;
  }

  get votingToken() {
    return this.properties.votingToken;
  }

  get amount() {
    return this.properties.amount;
  }

  get totalSupplyOfVotingToken() {
    return this.properties.totalSupplyOfVotingToken;
  }

  get votingThreshold() {
    return this.properties.votingThreshold;
  }

  get minimumVotingParticipants() {
    return this.properties.minimumVotingParticipants;
  }

  get minimumTotalVotingTokens() {
    return this.properties.minimumTotalVotingTokens;
  }

  get isRelativeMajority() {
    return this.properties.isRelativeMajority;
  }

  static async createInstance(
    config: Config,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: zDAOProperties,
    options: any
  ): Promise<zDAO> {
    if (options === undefined) {
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

    const zDAO = new DAOClient(
      snapshotClient,
      gnosisSafeClient,
      properties,
      options
    );
    return zDAO;
  }

  async listAssetsCoins(): Promise<zDAOCoins> {
    const results = await this.gnosisSafeClient.listAssets(
      this.safeAddress,
      this.network
    );
    return {
      amountInUSD: Number(results.fiatTotal),
      coins: results.items
        .filter((item) => Number(item.fiatBalance) > 0)
        .map((item) => ({
          type: item.tokenInfo.type as string as AssetType,
          address: item.tokenInfo.address,
          decimals: item.tokenInfo.decimals,
          symbol: item.tokenInfo.symbol,
          name: item.tokenInfo.name,
          logoUri: item.tokenInfo.logoUri ?? undefined,
          amount: item.balance,
          amountInUSD: Number(item.fiatBalance),
        })),
    };
  }

  async listAssetsCollectibles(): Promise<zDAOCollectibles> {
    const results = await this.gnosisSafeClient.listCollectibles(
      this.safeAddress,
      this.network
    );
    return results.map((item: any) => ({
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
    }));
  }

  async listAssets(): Promise<zDAOAssets> {
    const results = await Promise.all([
      this.listAssetsCoins(),
      this.listAssetsCollectibles(),
    ]);
    const balances = results[0];
    const collectibles = results[1];

    return {
      ...balances,
      collectibles,
    };
  }

  async listTransactions(): Promise<Transaction[]> {
    const transactions: GnosisTransaction[] =
      await this.gnosisSafeClient.listTransactions(
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

    const spliceTxHash = (id: string): string => {
      // transaction id([network]_[recipient]_[txHash]_[checksum?]):
      // ethereum_0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa_0x0d3c7cde981f654a85d2fbbc76e47ed4bfd3641b12fbe34df36a8d98957d994b_0x3f5adae914eefce2
      const words = id.split('_');
      return words[2];
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
        txHash: spliceTxHash(tx.transaction.id),
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
    const limit = 1000;
    let from = pagination?.from ?? 0;
    let count = pagination?.count ?? limit;
    let numberOfResults = limit;
    const snapshotProposals: SnapshotProposal[] = [];

    // get the list of proposals
    while (numberOfResults === limit) {
      const results: SnapshotProposal[] =
        await this.snapshotClient.listProposals(
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
          this.snapshotClient,
          this.gnosisSafeClient,
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
            strategies: this.options.strategies,
            scores_state: proposal.scores_state,
          }
        )
    );

    return await Promise.all(promises);
  }

  async getProposal(id: ProposalId): Promise<Proposal> {
    await this.snapshotClient.forceUpdateScoresAndVotes(id);

    const proposal: SnapshotProposal = await this.snapshotClient.getProposal({
      spaceId: this.ens,
      network: this.network,
      strategies: this.options.strategies,
      proposalId: id,
    });

    return await ProposalClient.createInstance(
      this,
      this.snapshotClient,
      this.gnosisSafeClient,
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
        strategies: this.options.strategies,
        scores_state: proposal.scores_state,
      }
    );
  }

  async createProposal(
    provider: Web3Provider | Wallet,
    account: string,
    payload: CreateProposalParams
  ): Promise<ProposalId> {
    if (!this.duration && !payload.duration) {
      throw new Error(errorMessageForError('invalid-proposal-duration'));
    }

    if (payload.transfer) {
      payload.choices = DEFAULT_PROPOSAL_CHOICES;
    }
    if (!payload.choices) {
      payload.choices = DEFAULT_PROPOSAL_CHOICES;
    }

    const signer = getSigner(provider, account);
    const signerAddress = await signer.getAddress();

    // signer should have valid amount of voting token on Ethereum
    const contract = new Contract(this.votingToken.token, ERC20Abi, provider);

    const balance = await contract.balanceOf(signerAddress);
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
    const { id: proposalId } = await this.snapshotClient.createProposal(
      provider,
      signerAddress,
      {
        spaceId: this.ens,
        title: payload.title,
        body: payload.body ?? '',
        choices: payload.choices,
        delay: this.options.delay,
        duration: duration!,
        snapshot: Number(payload.snapshot),
        network: this.network,
        strategies: this.options.strategies,
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
