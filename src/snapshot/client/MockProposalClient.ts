import { ethers } from 'ethers';

import { AbstractProposalClient } from '../../client';
import { NotImplementedError, ProposalProperties } from '../../types';
import {
  CalculateSnapshotProposalParams,
  ExecuteSnapshotProposalParams,
  FinalizeSnapshotProposalParams,
  SnapshotProposal,
  SnapshotVote,
  VoteSnapshotProposalParams,
} from '../types';
import MockDAOClient from './MockDAOClient';

class MockProposalClient extends AbstractProposalClient<SnapshotVote> {
  private readonly zDAO: MockDAOClient;
  private votes: SnapshotVote[] = [];

  constructor(properties: ProposalProperties, zDAO: MockDAOClient) {
    super(properties);
    this.zDAO = zDAO;
  }

  listVotes(): Promise<SnapshotVote[]> {
    return Promise.resolve(this.votes);
  }

  getVotingPowerOfUser(_: string): Promise<string> {
    return Promise.resolve('1');
  }

  updateScoresAndVotes(): Promise<SnapshotProposal> {
    return Promise.resolve(this);
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    payload: VoteSnapshotProposalParams
  ): Promise<void> {
    const address = account;
    const found = this.votes.find((item) => item.voter == address);
    if (!found) {
      this.votes.push({
        voter: address,
        choice: payload.choice,
        votes: '1',
      });
    } else {
      found.choice = payload.choice;
    }
  }

  calculate(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: CalculateSnapshotProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  finalize(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: FinalizeSnapshotProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  execute(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: ExecuteSnapshotProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }
}

export default MockProposalClient;
