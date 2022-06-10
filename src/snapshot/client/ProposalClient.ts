import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import { GnosisSafeClient } from '../../gnosis-safe';
import {
  Choice,
  NotImplementedError,
  PaginationParam,
  Proposal,
  ProposalProperties,
  Vote,
} from '../../types';
import { SnapshotClient } from '../snapshot';
import { ZDAOOptions } from '../types';
import { errorMessageForError } from '../utilities/messages';
import DAOClient from './DAOClient';

class ProposalClient implements Proposal {
  private readonly _zDAO: DAOClient;
  private readonly _snapshotClient: SnapshotClient;
  private readonly _gnosisSafeClient: GnosisSafeClient;
  protected readonly _properties: ProposalProperties;
  private readonly _options: any;

  private constructor(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties,
    options: any
  ) {
    this._zDAO = zDAO;
    this._snapshotClient = snapshotClient;
    this._gnosisSafeClient = gnosisSafeClient;
    this._properties = cloneDeep(properties);
    this._options = options;
  }

  get id() {
    return this._properties.id;
  }

  get createdBy() {
    return this._properties.createdBy;
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

  get snapshot() {
    return this._properties.snapshot;
  }

  get scores() {
    return this._properties.scores;
  }

  get voters() {
    return this._properties.voters;
  }

  get metadata() {
    return this._properties.metadata;
  }

  static async createInstance(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties,
    options: any
  ): Promise<Proposal> {
    const proposal = new ProposalClient(
      zDAO,
      snapshotClient,
      gnosisSafeClient,
      properties,
      options
    );
    await proposal.getTokenMetadata();
    return proposal;
  }

  private async getTokenMetadata() {
    try {
      if (!this.ipfs || this.metadata) return;

      const ipfsData = await this._snapshotClient.ipfsGet(this.ipfs);
      if (!ipfsData.data || !ipfsData.data.message) {
        throw new Error(errorMessageForError('empty-voting-token'));
      }

      const metadataJson = JSON.parse(ipfsData.data.message.metadata);
      if (
        !metadataJson.sender ||
        !metadataJson.recipient ||
        !metadataJson.token ||
        !metadataJson.amount
      ) {
        this._properties.metadata = undefined;
        return;
      }

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
      // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  async listVotes(pagination?: PaginationParam): Promise<Vote[]> {
    const limit = 30000;
    let from = pagination?.from ?? 0;
    let count = pagination?.count ?? limit;
    let numberOfResults = limit;
    const votes: Vote[] = [];

    while (numberOfResults === limit) {
      const results = await this._snapshotClient.listVotes({
        spaceId: (this._zDAO.options as ZDAOOptions).ens,
        network: this._zDAO.network.toString(),
        strategies: this._options.strategies,
        proposalId: this.id,
        scores_state: this._options.scores_state,
        snapshot: Number(this.snapshot),
        from,
        count: count >= limit ? limit : count,
        voter: '',
      });
      votes.push(
        ...results.map((vote: any) => ({
          voter: vote.voter,
          choice: vote.choice as Choice,
          votes: vote.power,
        }))
      );
      from += results.length;
      count -= results.length;
      numberOfResults = results.length;
    }
    return votes;
  }

  async getVotingPowerOfUser(account: string): Promise<string> {
    return this._snapshotClient
      .getVotingPower({
        spaceId: (this._zDAO.options as ZDAOOptions).ens,
        network: this._zDAO.network.toString(),
        snapshot: Number(this.snapshot),
        voter: account,
      })
      .then((value) => value.toString());
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    choice: Choice
  ): Promise<void> {
    await this._snapshotClient.voteProposal(provider, account, {
      spaceId: (this._zDAO.options as ZDAOOptions).ens,
      proposalId: this.id,
      choice,
    });
  }

  async calculate(_: ethers.Signer): Promise<void> {
    throw new NotImplementedError();
  }

  async execute(signer: ethers.Signer): Promise<void> {
    if (!this.metadata) return;

    const address = await signer.getAddress();
    const isOwner = await this._gnosisSafeClient.isOwnerAddress(
      signer,
      (this._zDAO.options as ZDAOOptions).ens,
      address
    );
    if (!isOwner) {
      throw new Error(errorMessageForError('not-gnosis-owner'));
    }

    if (!this.metadata) {
      throw new Error(errorMessageForError('empty-metadata'));
    }

    if (!this.metadata?.token || this.metadata.token.length < 1) {
      // Ether transfer
      await this._gnosisSafeClient.transferEther(
        this._zDAO.gnosisSafe,
        signer,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.metadata!.recipient,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.metadata!.amount.toString()
      );
    } else {
      // ERC20 transfer
      await this._gnosisSafeClient.transferERC20(
        this._zDAO.gnosisSafe,
        signer,
        this.metadata.token,
        this.metadata.recipient,
        this.metadata.amount.toString()
      );
    }
  }

  getCheckPointingHashes(): Promise<string[]> {
    throw new NotImplementedError();
  }
}

export default ProposalClient;
