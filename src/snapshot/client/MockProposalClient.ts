import { ethers } from 'ethers';

import { AbstractProposalClient } from '../../client';
import {
  CalculateProposalParams,
  ExecuteProposalParams,
  FinalizeProposalParams,
  NotImplementedError,
  Proposal,
  ProposalProperties,
  Vote,
} from '../../types';
import { VoteProposalParams } from '../snapshot/types';
import MockDAOClient from './MockDAOClient';

class MockProposalClient extends AbstractProposalClient {
  private _votes: Vote[] = [];
  private readonly _zDAO: MockDAOClient;

  constructor(properties: ProposalProperties, zDAO: MockDAOClient) {
    super(properties);
    this._zDAO = zDAO;
  }

  listVotes(): Promise<Vote[]> {
    return Promise.resolve(this._votes);
  }

  getVotingPowerOfUser(_: string): Promise<string> {
    return Promise.resolve('1');
  }

  updateScoresAndVotes(): Promise<Proposal> {
    return Promise.resolve(this);
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    payload: VoteProposalParams
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

  calculate(_: ethers.Signer, _2: CalculateProposalParams): Promise<void> {
    throw new NotImplementedError();
  }

  finalize(_: ethers.Signer, _2: FinalizeProposalParams): Promise<void> {
    throw new NotImplementedError();
  }

  execute(_: ethers.Signer, _2: ExecuteProposalParams): Promise<void> {
    throw new NotImplementedError();
  }

  getCheckPointingHashes(): Promise<string[]> {
    throw new NotImplementedError();
  }
}

export default MockProposalClient;
