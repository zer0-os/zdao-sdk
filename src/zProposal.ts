import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ethers } from 'ethers';

import GnosisSafeClient from './gnosis-safe';
import SnapshotClient from './snapshot-io';
import { Choice, Proposal, TokenMetaData, Vote, VoteChoice } from './types';
import { t } from './utilities/messages';
import zDAOClient from './zDAOClient';

class zProposal implements Proposal {
  private readonly _zDAO: zDAOClient;
  private readonly _snapshotClient: SnapshotClient;
  private readonly _gnosisSafeClient: GnosisSafeClient;
  private readonly _id: string;
  private readonly _type: string;
  private readonly _author: string;
  private readonly _title: string;
  private readonly _body: string;
  private readonly _ipfs: string;
  private readonly _choices: VoteChoice[];
  private readonly _created: Date;
  private readonly _start: Date;
  private readonly _end: Date;
  private readonly _state: 'pending' | 'active' | 'closed';
  private readonly _network: string;
  private readonly _snapshot: string;
  private readonly _scores: number[];
  private readonly _votes: number;
  private _metadata: TokenMetaData | undefined;

  constructor(
    zDAO: zDAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    id: string,
    type: string,
    author: string,
    title: string,
    body = '',
    ipfs: string,
    choices: VoteChoice[],
    created: Date,
    start: Date,
    end: Date,
    state: 'pending' | 'active' | 'closed',
    network: string,
    snapshot: string,
    scores: number[],
    votes: number
  ) {
    this._zDAO = zDAO;
    this._snapshotClient = snapshotClient;
    this._gnosisSafeClient = gnosisSafeClient;
    this._id = id;
    this._type = type;
    this._author = author;
    this._title = title;
    this._body = body;
    this._ipfs = ipfs;
    this._choices = choices;
    this._created = created;
    this._start = start;
    this._end = end;
    this._state = state;
    this._network = network;
    this._snapshot = snapshot;
    this._scores = scores;
    this._votes = votes;
  }

  get id() {
    return this._id;
  }

  get type() {
    return this._type;
  }

  get author() {
    return this._author;
  }

  get title() {
    return this._title;
  }

  get body() {
    return this._body;
  }

  get ipfs() {
    return this._ipfs;
  }

  get choices() {
    return this._choices;
  }

  get created() {
    return this._created;
  }

  get start() {
    return this._start;
  }

  get end() {
    return this._end;
  }

  get state() {
    return this._state;
  }

  get network() {
    return this._network;
  }

  get snapshot() {
    return this._snapshot;
  }

  get scores() {
    return this._scores;
  }

  get votes() {
    return this._votes;
  }

  get metadata() {
    return this._metadata;
  }

  async getTokenMetadata(): Promise<TokenMetaData> {
    if (this._ipfs) {
      throw Error(t('empty-voting-token'));
    }
    if (this._metadata) {
      return this._metadata;
    }

    const ipfsData = await this._snapshotClient.ipfsGet(this._ipfs);
    if (!ipfsData.data || !ipfsData.data.message) {
      throw Error(t('empty-voting-token'));
    }

    const metadataJson = JSON.parse(ipfsData.data.message.metadata);
    const sender = metadataJson.sender;
    const recipient = metadataJson.recipient;
    const token = metadataJson.token;
    const decimals = metadataJson.decimals ?? 18;
    const symbol = metadataJson.symbol ?? 'zToken';
    const amount = metadataJson.amount;

    this._metadata = {
      sender,
      recipient,
      token,
      decimals,
      symbol,
      amount,
    };
    return this._metadata;
  }

  async listVotes(from = 0, count = 30000, voter = ''): Promise<Vote[]> {
    const votes = await this._snapshotClient.listVotes(
      this._id,
      from,
      count,
      voter
    );

    return votes.map((vote: any) => ({
      voter: vote.voter,
      choice: vote.choice as Choice,
      power: vote.vp,
    }));
  }

  async getVotingPowerOfUser(account: string): Promise<number> {
    if (!this._metadata) {
      throw Error(t('empty-metadata'));
    }
    return this._snapshotClient.getERCBalanceOf(
      this._zDAO.zNA,
      this._network,
      parseInt(this._snapshot),
      this._metadata.token,
      this._metadata.decimals,
      this._metadata.symbol,
      account
    );
  }

  async vote(signer: ethers.Wallet, choice: Choice): Promise<string> {
    return this._snapshotClient.voteProposal(
      signer,
      this._zDAO.zNA,
      this._id,
      choice
    );
  }

  async execute(signer: ethers.Wallet): Promise<TransactionResponse> {
    const isOwner = await this._gnosisSafeClient.isOwnerAddress(
      signer,
      this._zDAO.zNA,
      signer.address
    );
    if (!isOwner) {
      throw Error(t('not-gnosis-owner'));
    }

    if (!this._metadata) {
      throw Error(t('empty-metadata'));
    }

    if (!this._metadata?.token || this._metadata.token.length < 1) {
      // Ether transfer
      return await this._gnosisSafeClient.transferEther(
        this._zDAO.safeAddress,
        signer,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._metadata!.recipient,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._metadata!.amount.toString()
      );
    } else {
      // ERC20 transfer
      return await this._gnosisSafeClient.transferERC20(
        this._zDAO.safeAddress,
        signer,
        this._metadata.token,
        this._metadata.recipient,
        this._metadata.amount.toString()
      );
    }
  }
}

export default zProposal;
