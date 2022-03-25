import {
  Erc20Transfer as GnosisErc20Transfer,
  Erc721Transfer as GnosisErc721Transfer,
  NativeCoinTransfer as GnosisNativeCoinTransfer,
  Transaction as GnosisTransaction,
  Transfer as GnosisTransfer,
  TransferInfo as GnosisTransferInfo,
} from '@gnosis.pm/safe-react-gateway-sdk';
import { ethers } from 'ethers';

import GnosisSafeClient from './gnosis-safe';
import SnapshotClient from './snapshot-io';
import { SnapshotProposal } from './snapshot-io/types';
import {
  AssetType,
  Config,
  CreateProposalParams,
  Proposal,
  ProposalId,
  Transaction,
  TransactionStatus,
  TransactionType,
  TransferInfo,
  VoteChoice,
  zDAO,
  zDAOAssets,
  zDAOId,
  zNA,
} from './types';
import zProposal from './zProposal';

class zDAOClient implements zDAO {
  private readonly _config: Config;
  protected readonly _snapshotClient: SnapshotClient;
  protected readonly _gnosisSafeClient: GnosisSafeClient;
  private readonly _id: zDAOId;
  private readonly _zNA: zNA;
  private readonly _title: string;
  private readonly _creator: string;
  private readonly _avatar: string | undefined;
  private readonly _network: string;
  private readonly _safeAddress: string;
  private readonly _votingToken: string;

  constructor(
    config: Config,
    id: zDAOId,
    zNA: zNA,
    title: string,
    creator: string,
    avatar: string | undefined,
    network: string,
    safeAddress: string,
    votingToken: string
  ) {
    this._config = config;
    this._id = id;
    this._zNA = zNA;
    this._title = title;
    this._creator = creator;
    this._avatar = avatar;
    this._network = network;
    this._safeAddress = safeAddress;
    this._votingToken = votingToken;

    this._snapshotClient = new SnapshotClient(config.snapshot);
    this._gnosisSafeClient = new GnosisSafeClient(config.gnosisSafe);
  }

  get id() {
    return this._id;
  }

  get zNA() {
    return this._zNA;
  }

  get title() {
    return this._title;
  }

  get creator() {
    return this._creator;
  }

  get avatar() {
    return this._avatar;
  }

  get network() {
    return this._network;
  }

  get safeAddress() {
    return this._safeAddress;
  }

  get votingToken() {
    return this._votingToken;
  }

  async listAssets(): Promise<zDAOAssets> {
    const balances = await this._gnosisSafeClient.listAssets(
      this._safeAddress,
      this._network
    );

    return {
      amountInUSD: Number(balances.fiatTotal),
      assets: balances.items.map((item: any) => ({
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

  async listTransactions(): Promise<Transaction[]> {
    const transactions: GnosisTransaction[] =
      await this._gnosisSafeClient.listTransactions(
        this._safeAddress,
        this._network
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

  async listProposals(from = 0, count = 3000): Promise<Proposal[]> {
    const proposals: SnapshotProposal[] =
      await this._snapshotClient.listProposals(
        this._zNA,
        this._network,
        from,
        count
      );

    return proposals.map(
      (proposal: SnapshotProposal): Proposal =>
        new zProposal(
          this,
          this._snapshotClient,
          this._gnosisSafeClient,
          proposal.id,
          proposal.type,
          proposal.author,
          proposal.title,
          proposal.body ?? '',
          proposal.ipfs,
          proposal.choices.map((choice: string) => choice as VoteChoice),
          proposal.created,
          proposal.start,
          proposal.end,
          proposal.state,
          proposal.network,
          proposal.snapshot,
          proposal.scores,
          proposal.votes
        )
    );
  }

  async getProposal(id: ProposalId): Promise<Proposal> {
    const proposal: SnapshotProposal = await this._snapshotClient.getProposal(
      id
    );

    const instance = new zProposal(
      this,
      this._snapshotClient,
      this._gnosisSafeClient,
      proposal.id,
      proposal.type,
      proposal.author,
      proposal.title,
      proposal.body ?? '',
      proposal.ipfs,
      proposal.choices.map((choice: string) => choice as VoteChoice),
      proposal.created,
      proposal.start,
      proposal.end,
      proposal.state,
      proposal.network,
      proposal.snapshot,
      proposal.scores,
      proposal.votes
    );
    await instance.getTokenMetadata();
    return instance;
  }

  async createProposal(
    signer: ethers.Wallet,
    payload: CreateProposalParams
  ): Promise<zProposal> {
    const { id: proposalId } = await this._snapshotClient.createProposal(
      signer,
      this._zNA,
      payload.title,
      payload.body,
      Object.values(VoteChoice),
      payload.duration,
      payload.snapshot,
      this._network,
      this._safeAddress,
      payload.transfer.recipient,
      payload.transfer.token,
      payload.transfer.decimals,
      payload.transfer.symbol,
      payload.transfer.amount
    );

    const proposal = await this._snapshotClient.getProposal(proposalId);
    const instance = new zProposal(
      this,
      this._snapshotClient,
      this._gnosisSafeClient,
      proposal.id,
      proposal.type,
      proposal.author,
      proposal.title,
      proposal.body,
      proposal.ipfs,
      proposal.choices.map((choice: string) => choice as VoteChoice),
      proposal.created,
      proposal.start,
      proposal.end,
      proposal.state,
      proposal.network,
      proposal.snapshot,
      proposal.scores,
      proposal.votes
    );
    await instance.getTokenMetadata();
    return instance;
  }
}

export default zDAOClient;
