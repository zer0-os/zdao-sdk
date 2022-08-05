import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import GnosisSafeClient from '../gnosis-safe';
import SnapshotClient from '../snapshot-io';
import { SnapshotProposal } from '../snapshot-io/types';
import {
  PaginationParam,
  PlatformType,
  ProposalProperties,
  ProposalState,
  VoteId,
} from '../types';
import { Choice, Proposal, Vote } from '../types';
import { errorMessageForError } from '../utilities/messages';
import DAOClient from './DAOClient';

class ProposalClient implements Proposal {
  private readonly _zDAO: DAOClient;
  private readonly _snapshotClient: SnapshotClient;
  private readonly _gnosisSafeClient: GnosisSafeClient;
  protected readonly _properties: ProposalProperties;
  private readonly _provider: ethers.providers.Provider;
  private readonly _options: any;

  private constructor(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties,
    provider: ethers.providers.Provider,
    options: any
  ) {
    this._zDAO = zDAO;
    this._snapshotClient = snapshotClient;
    this._gnosisSafeClient = gnosisSafeClient;
    this._properties = cloneDeep(properties);
    this._provider = provider;
    this._options = options;
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

  static async createInstance(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties,
    provider: ethers.providers.Provider,
    options: any
  ): Promise<Proposal> {
    const proposal = new ProposalClient(
      zDAO,
      snapshotClient,
      gnosisSafeClient,
      properties,
      provider,
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

      const sender = metadataJson.sender;
      const recipient = metadataJson.recipient;
      const token = metadataJson.token;
      const decimals = metadataJson.decimals ?? 18;
      const symbol = metadataJson.symbol ?? 'zToken';
      const amount = metadataJson.amount;

      this._properties.metadata = {
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
        spaceId: this._zDAO.ens,
        network: this._zDAO.network,
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
          power: vote.power,
        }))
      );
      from += results.length;
      count -= results.length;
      numberOfResults = results.length;
    }
    return votes;
  }

  async getVotingPowerOfUser(account: string): Promise<number> {
    return this._snapshotClient.getVotingPower({
      spaceId: this._zDAO.ens,
      network: this.network,
      snapshot: Number(this.snapshot),
      voter: account,
    });
  }

  async updateScoresAndVotes(): Promise<Proposal> {
    const mapState = (
      state: ProposalState
    ): 'pending' | 'active' | 'closed' => {
      if (state === ProposalState.PENDING) {
        return 'pending';
      } else if (state === ProposalState.ACTIVE) {
        return 'active';
      }
      return 'closed';
    };

    const snapshotProposal: SnapshotProposal = {
      id: this._properties.id,
      type: this._properties.type,
      author: this._properties.author,
      title: this._properties.title,
      body: this._properties.body,
      ipfs: this._properties.ipfs,
      choices: this._properties.choices,
      created: this._properties.created,
      start: this._properties.start,
      end: this._properties.end,
      state: mapState(this._properties.state),
      scores_state: this._options.scores_state,
      network: this._properties.network,
      snapshot: Number(this._properties.snapshot),
      scores: this._properties.scores,
      votes: this._properties.votes,
    };

    const updated = await this._snapshotClient.updateScoresAndVotes(
      snapshotProposal,
      {
        spaceId: this._zDAO.ens,
        network: this._zDAO.network,
        strategies: this._options.strategies,
      }
    );
    this._properties.scores = updated.scores;
    this._properties.votes = updated.votes;
    return this;
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    choice: Choice
  ): Promise<VoteId> {
    return this._snapshotClient.voteProposal(provider, account, {
      spaceId: this._zDAO.ens,
      proposalId: this.id,
      choice,
    });
  }

  async isExecuted(): Promise<boolean> {
    const executed = await this._gnosisSafeClient.isProposalsExecuted(
      PlatformType.Snapshot,
      [this.id]
    );
    return executed[0];
  }

  async execute(signer: ethers.Signer): Promise<void> {
    const address = await signer.getAddress();
    const isOwner = await this._gnosisSafeClient.isOwnerAddress(
      signer,
      this._zDAO.safeAddress,
      address
    );
    if (!isOwner) {
      throw new Error(errorMessageForError('not-gnosis-owner'));
    }

    if (!this.metadata) {
      throw new Error(errorMessageForError('empty-metadata'));
    }
    if (this.state !== ProposalState.AWAITING_EXECUTION) {
      throw new Error(errorMessageForError('not-executable-proposal'));
    }

    try {
      // check if proposal executed
      const executed = await this.isExecuted();
      if (!executed) {
        throw new Error(errorMessageForError('proposal-already-executed'));
      }

      const token =
        !this.metadata?.token ||
        this.metadata.token.length < 1 ||
        this.metadata.token === ethers.constants.AddressZero
          ? ethers.constants.AddressZero
          : this.metadata.token;

      await this._gnosisSafeClient.proposeTxFromModule(
        this._zDAO.safeAddress,
        signer,
        'executeProposal',
        [
          PlatformType.Snapshot.toString(),
          this.id,
          token,
          this.metadata.recipient,
          this.metadata.amount,
        ]
      );
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new Error(errorMsg);
    }
  }
}

export default ProposalClient;
