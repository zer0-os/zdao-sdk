import { ethers } from 'ethers';

import { AbstractProposalClient } from '../../client';
import {
  CalculateProposalParams,
  ExecuteProposalParams,
  FinalizeProposalParams,
  NotImplementedError,
  ProposalProperties,
  Vote,
  VoteProposalParams,
} from '../../types';
import { Proposal } from '../types';
import MockDAOClient from './MockDAOClient';

class MockProposalClient extends AbstractProposalClient implements Proposal {
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

    const vp = Number(await this.getVotingPowerOfUser(account));
    if (!found) {
      this._votes.push({
        voter: address,
        choice: payload.choice,
        votes: vp.toString(),
      });
      this._properties.voters = (this._properties.voters ?? 0) + vp;
    } else {
      found.choice = payload.choice;
    }
    if (this._properties.scores) {
      this._properties.scores[payload.choice] = (
        Number(this._properties.scores) + vp
      ).toString();
    }
  }

  calculate(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: CalculateProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  finalize(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: FinalizeProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  execute(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: ExecuteProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  getCheckPointingHashes(): Promise<string[]> {
    throw new NotImplementedError();
  }
}

export default MockProposalClient;
