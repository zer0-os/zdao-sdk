import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { cloneDeep } from 'lodash';

import GnosisSafeClient from '../gnosis-safe';
import SnapshotClient from '../snapshot-io';
import { SnapshotProposal } from '../snapshot-io/types';
import {
  PaginationParam,
  ProposalProperties,
  ProposalState,
  VoteId,
} from '../types';
import { Choice, Proposal, Vote } from '../types';
import { getDecimalAmount } from '../utilities';
import { errorMessageForError } from '../utilities/messages';
import DAOClient from './DAOClient';

class ProposalClient implements Proposal {
  private readonly zDAO: DAOClient;
  private readonly snapshotClient: SnapshotClient;
  private readonly gnosisSafeClient: GnosisSafeClient;
  protected readonly properties: ProposalProperties;
  private readonly options: any;

  private constructor(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties,
    options: any
  ) {
    this.zDAO = zDAO;
    this.snapshotClient = snapshotClient;
    this.gnosisSafeClient = gnosisSafeClient;

    this.properties = cloneDeep(properties);
    this.options = options;
  }

  get id() {
    return this.properties.id;
  }

  get type() {
    return this.properties.type;
  }

  get author() {
    return this.properties.author;
  }

  get title() {
    return this.properties.title;
  }

  get body() {
    return this.properties.body;
  }

  get ipfs() {
    return this.properties.ipfs;
  }

  get choices() {
    return this.properties.choices;
  }

  get created() {
    return this.properties.created;
  }

  get start() {
    return this.properties.start;
  }

  get end() {
    return this.properties.end;
  }

  get state() {
    return this.properties.state;
  }

  get network() {
    return this.properties.network;
  }

  get snapshot() {
    return this.properties.snapshot;
  }

  get scores() {
    return this.properties.scores;
  }

  get votes() {
    return this.properties.votes;
  }

  get metadata() {
    return this.properties.metadata;
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
    if (!this.ipfs || this.metadata) return;

    const ipfsData = await this.snapshotClient.ipfsGet(this.ipfs);
    if (!ipfsData.data || !ipfsData.data.message) {
      throw new Error(errorMessageForError('empty-voting-token'));
    }
    if (!ipfsData.data.message.metadata) {
      this.properties.metadata = undefined;
      return;
    }

    const metadataJson = JSON.parse(ipfsData.data.message.metadata);
    if (
      !metadataJson.sender ||
      !metadataJson.recipient ||
      !metadataJson.token ||
      !metadataJson.amount
    ) {
      this.properties.metadata = undefined;
      return;
    }

    const sender = metadataJson.sender;
    const recipient = metadataJson.recipient;
    const token = metadataJson.token;
    const decimals = metadataJson.decimals ?? 18;
    const symbol = metadataJson.symbol ?? 'zToken';
    const amount = metadataJson.amount;

    this.properties.metadata = {
      sender,
      recipient,
      token,
      decimals,
      symbol,
      amount,
    };
  }

  async listVotes(pagination?: PaginationParam): Promise<Vote[]> {
    const limit = 1000;
    let from = pagination?.from ?? 0;
    let count = pagination?.count ?? limit;
    let numberOfResults = limit;
    const votes: Vote[] = [];

    while (numberOfResults === limit) {
      const results = await this.snapshotClient.listVotes({
        spaceId: this.zDAO.ens,
        network: this.zDAO.network,
        strategies: this.options.strategies,
        proposalId: this.id,
        scores_state: this.options.scores_state,
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
    return this.snapshotClient.getVotingPower({
      spaceId: this.zDAO.ens,
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
      id: this.properties.id,
      type: this.properties.type,
      author: this.properties.author,
      title: this.properties.title,
      body: this.properties.body,
      ipfs: this.properties.ipfs,
      choices: this.properties.choices,
      created: this.properties.created,
      start: this.properties.start,
      end: this.properties.end,
      state: mapState(this.properties.state),
      scores_state: this.options.scores_state,
      network: this.properties.network,
      snapshot: Number(this.properties.snapshot),
      scores: this.properties.scores,
      votes: this.properties.votes,
    };

    const updated = await this.snapshotClient.updateScoresAndVotes(
      snapshotProposal,
      {
        spaceId: this.zDAO.ens,
        network: this.zDAO.network,
        strategies: this.options.strategies,
      }
    );
    this.properties.scores = updated.scores;
    this.properties.votes = updated.votes;
    return this;
  }

  async vote(
    provider: Web3Provider | Wallet,
    account: string,
    choice: Choice
  ): Promise<VoteId> {
    return this.snapshotClient.voteProposal(provider, account, {
      spaceId: this.zDAO.ens,
      proposalId: this.id,
      choice,
    });
  }

  canExecute(): boolean {
    if (this.zDAO.isRelativeMajority) return false;

    const totalScore = this.scores.reduce((prev, current) => prev + current, 0);
    const totalScoreAsBN = getDecimalAmount(
      BigNumber.from(totalScore),
      this.zDAO.votingToken.decimals
    );
    if (totalScoreAsBN.gte(this.zDAO.minimumTotalVotingTokens)) {
      return true;
    }
    return false;
  }
}

export default ProposalClient;
