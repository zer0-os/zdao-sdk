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
  private _votes: SnapshotVote[] = [];
  private readonly _zDAO: MockDAOClient;

  constructor(properties: ProposalProperties, zDAO: MockDAOClient) {
    super(properties);
    this._zDAO = zDAO;
  }

  listVotes(): Promise<SnapshotVote[]> {
    return Promise.resolve(this._votes);
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
    const found = this._votes.find((item) => item.voter == address);
    if (!found) {
      this._votes.push({
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
