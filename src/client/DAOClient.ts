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

import GnosisSafeClient from '../gnosis-safe';
import SnapshotClient from '../snapshot-io';
import { SnapshotProposal } from '../snapshot-io/types';
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
  zDAOProperties,
} from '../types';
import { errorMessageForError } from '../utilities/messages';
import ProposalClient from './ProposalClient';

class DAOClient implements zDAO {
  private readonly _config: Config;
  protected readonly _snapshotClient: SnapshotClient;
  protected readonly _gnosisSafeClient: GnosisSafeClient;
  protected readonly _properties: zDAOProperties;

  constructor(config: Config, properties: zDAOProperties) {
    this._config = config;
    this._properties = cloneDeep(properties);

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

  get avatar() {
    return this._properties.avatar;
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

  async listAssets(): Promise<zDAOAssets> {
    const balances = await this._gnosisSafeClient.listAssets(
      this.safeAddress,
      this.network
    );

    const collectibles = await this._gnosisSafeClient.listCollectibles(
      this.safeAddress,
      this.network
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

  async listProposals(): Promise<Proposal[]> {
    const count = 3000;
    let from = 0;
    let numberOfResults = count;
    const proposals: Proposal[] = [];
    while (numberOfResults === count) {
      const results: SnapshotProposal[] =
        await this._snapshotClient.listProposals(
          this.ens,
          this.network,
          from,
          count
        );

      proposals.push(
        ...results.map(
          (proposal: SnapshotProposal): Proposal =>
            new ProposalClient(
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
                choices: proposal.choices.map(
                  (choice: string) => choice as VoteChoice
                ),
                created: proposal.created,
                start: proposal.start,
                end: proposal.end,
                state: proposal.state,
                network: proposal.network,
                snapshot: proposal.snapshot,
                scores: proposal.scores,
                votes: proposal.votes,
              }
            )
        )
      );
      from += results.length;
      numberOfResults = results.length;
    }
    return proposals;
  }

  async getProposal(id: ProposalId): Promise<Proposal> {
    const proposal: SnapshotProposal = await this._snapshotClient.getProposal(
      id
    );

    const instance = new ProposalClient(
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
        choices: proposal.choices.map((choice: string) => choice as VoteChoice),
        created: proposal.created,
        start: proposal.start,
        end: proposal.end,
        state: proposal.state,
        network: proposal.network,
        snapshot: proposal.snapshot,
        scores: proposal.scores,
        votes: proposal.votes,
      }
    );
    await instance.getTokenMetadata();
    return instance;
  }

  async createProposal(
    signer: ethers.Wallet,
    payload: CreateProposalParams
  ): Promise<ProposalClient> {
    if (!this.duration && !payload.duration) {
      throw new Error(errorMessageForError('invalid-proposal-duration'));
    }
    const duration = this.duration ?? payload.duration;
    const { id: proposalId } = await this._snapshotClient.createProposal(
      signer,
      {
        spaceId: this.ens,
        title: payload.title,
        body: payload.body ?? '',
        choices: Object.values(VoteChoice),
        duration: duration!,
        snapshot: payload.snapshot,
        network: this.network,
        abi: payload.transfer.abi,
        sender: this.safeAddress,
        recipient: payload.transfer.recipient,
        token: payload.transfer.token,
        decimals: payload.transfer.decimals,
        symbol: payload.transfer.symbol,
        amount: payload.transfer.amount,
      }
    );

    const proposal = await this._snapshotClient.getProposal(proposalId);
    const instance = new ProposalClient(
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
        choices: proposal.choices.map((choice: string) => choice as VoteChoice),
        created: proposal.created,
        start: proposal.start,
        end: proposal.end,
        state: proposal.state,
        network: proposal.network,
        snapshot: proposal.snapshot,
        scores: proposal.scores,
        votes: proposal.votes,
      }
    );
    await instance.getTokenMetadata();
    return instance;
  }
}

export default DAOClient;
