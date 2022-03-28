import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import GnosisSafeClient from '../gnosis-safe';
import SnapshotClient from '../snapshot-io';
import { ProposalProperties, VoteId } from '../types';
import { Choice, Proposal, TokenMetaData, Vote } from '../types';
import { errorMessageForError } from '../utilities/messages';
import DAOClient from './DAOClient';

class ProposalClient implements Proposal {
  private readonly _zDAO: DAOClient;
  private readonly _snapshotClient: SnapshotClient;
  private readonly _gnosisSafeClient: GnosisSafeClient;
  protected readonly _properties: ProposalProperties;

  constructor(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties
  ) {
    this._zDAO = zDAO;
    this._snapshotClient = snapshotClient;
    this._gnosisSafeClient = gnosisSafeClient;
    this._properties = cloneDeep(properties);
  }

  get id() {
    return this._properties.id;
  }

  get type() {
    return this._properties.type;
  }

  get author() {
    return this._properties.author;
  }

  get title() {
    return this._properties.title;
  }

  get body() {
    return this._properties.body;
  }

  get ipfs() {
    return this._properties.ipfs;
  }

  get choices() {
    return this._properties.choices;
  }

  get created() {
    return this._properties.created;
  }

  get start() {
    return this._properties.start;
  }

  get end() {
    return this._properties.end;
  }

  get state() {
    return this._properties.state;
  }

  get network() {
    return this._properties.network;
  }

  get snapshot() {
    return this._properties.snapshot;
  }

  get scores() {
    return this._properties.scores;
  }

  get votes() {
    return this._properties.votes;
  }

  get metadata() {
    return this._properties.metadata;
  }

  async getTokenMetadata(): Promise<TokenMetaData> {
    if (!this.ipfs) {
      throw new Error(errorMessageForError('empty-voting-token'));
    }
    if (this.metadata) {
      return this.metadata;
    }

    const ipfsData = await this._snapshotClient.ipfsGet(this.ipfs);
    if (!ipfsData.data || !ipfsData.data.message) {
      throw new Error(errorMessageForError('empty-voting-token'));
    }

    const metadataJson = JSON.parse(ipfsData.data.message.metadata);
    const abi = metadataJson.abi;
    const sender = metadataJson.sender;
    const recipient = metadataJson.recipient;
    const token = metadataJson.token;
    const decimals = metadataJson.decimals ?? 18;
    const symbol = metadataJson.symbol ?? 'zToken';
    const amount = metadataJson.amount;

    this._properties.metadata = {
      abi,
      sender,
      recipient,
      token,
      decimals,
      symbol,
      amount,
    };
    return this._properties.metadata;
  }

  async listVotes(): Promise<Vote[]> {
    const count = 30000;
    let from = 0;
    let numberOfResults = count;
    const votes: Vote[] = [];
    while (numberOfResults === count) {
      const results = await this._snapshotClient.listVotes(
        this.id,
        from,
        count,
        ''
      );
      votes.push(
        ...results.map((vote: any) => ({
          voter: vote.voter,
          choice: vote.choice as Choice,
          power: vote.power,
        }))
      );
      from += results.length;
      numberOfResults = results.length;
    }
    return votes;
  }

  async getVotingPowerOfUser(account: string): Promise<number> {
    if (!this.metadata) {
      throw new Error(errorMessageForError('empty-metadata'));
    }
    return this._snapshotClient.getERC20BalanceOf({
      spaceId: this._zDAO.ens,
      network: this.network,
      snapshot: parseInt(this.snapshot),
      token: this.metadata.token,
      decimals: this.metadata.decimals,
      symbol: this.metadata.symbol,
      voter: account,
    });
  }

  async vote(signer: ethers.Wallet, choice: Choice): Promise<VoteId> {
    return this._snapshotClient.voteProposal(signer, {
      spaceId: this._zDAO.ens,
      proposalId: this.id,
      choice,
    });
  }

  async execute(
    signer: ethers.Wallet
  ): Promise<ethers.providers.TransactionResponse> {
    const isOwner = await this._gnosisSafeClient.isOwnerAddress(
      signer,
      this._zDAO.ens,
      signer.address
    );
    if (!isOwner) {
      throw new Error(errorMessageForError('not-gnosis-owner'));
    }

    if (!this.metadata) {
      throw new Error(errorMessageForError('empty-metadata'));
    }

    if (!this.metadata?.token || this.metadata.token.length < 1) {
      // Ether transfer
      return await this._gnosisSafeClient.transferEther(
        this._zDAO.safeAddress,
        signer,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.metadata!.recipient,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.metadata!.amount.toString()
      );
    } else {
      // ERC20 transfer
      return await this._gnosisSafeClient.transferERC20(
        this._zDAO.safeAddress,
        signer,
        this.metadata.token,
        this.metadata.recipient,
        this.metadata.amount.toString()
      );
    }
  }
}

export default ProposalClient;
