import { ethers } from 'ethers';

import { AbstractProposalClient, GnosisSafeClient } from '../../client';
import {
  Choice,
  NotImplementedError,
  PaginationParam,
  Proposal,
  ProposalProperties,
  ProposalState,
  Vote,
} from '../../types';
import { errorMessageForError } from '../../utilities';
import { SnapshotClient } from '../snapshot';
import { SnapshotProposal } from '../snapshot/types';
import { ZDAOOptions } from '../types';
import DAOClient from './DAOClient';
import GlobalClient from './GlobalClient';

class ProposalClient extends AbstractProposalClient {
  private readonly _zDAO: DAOClient;
  private readonly _snapshotClient: SnapshotClient;
  private readonly _gnosisSafeClient: GnosisSafeClient;
  private readonly _options: any;

  private constructor(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties,
    options: any
  ) {
    super(properties);
    this._zDAO = zDAO;
    this._snapshotClient = snapshotClient;
    this._gnosisSafeClient = gnosisSafeClient;
    this._options = options;
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
      {
        ...properties,
        metadata: await AbstractProposalClient.getTokenMetadata(
          GlobalClient.ipfsGateway,
          properties.ipfs
        ),
      },
      options
    );
    return proposal;
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

  async updateScoresAndVotes(): Promise<Proposal> {
    const mapState = (
      state: ProposalState
    ): 'pending' | 'active' | 'closed' => {
      if (state === ProposalState.PENDING) {
        return 'pending';
      } else if (state === ProposalState.ACTIVE) {
        return 'active';
      } else if (state === ProposalState.EXECUTED) {
        return 'closed';
      }
      return 'closed';
    };

    const snapshotProposal: SnapshotProposal = {
      id: this._properties.id,
      type: 'single-choice',
      author: this._properties.createdBy,
      title: this._properties.title,
      body: this._properties.body,
      ipfs: this._properties.ipfs,
      choices: this._properties.choices,
      created: this._properties.created,
      start: this._properties.start ?? new Date(),
      end: this._properties.end ?? new Date(),
      state: mapState(this._properties.state),
      scores_state: this._options.scores_state,
      network: this._zDAO.network.toString(),
      snapshot: Number(this._properties.snapshot),
      scores: this._properties.scores?.map((score) => Number(score)) ?? [],
      votes: this._properties.voters ?? 0,
    };

    const updated = await this._snapshotClient.updateScoresAndVotes(
      snapshotProposal,
      {
        spaceId: (this._zDAO.options as ZDAOOptions).ens,
        network: this._zDAO.network.toString(),
        strategies: this._options.strategies,
      }
    );
    this._properties.scores = updated.scores.map((score) => score.toString());
    this._properties.voters = updated.votes;
    return this;
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
