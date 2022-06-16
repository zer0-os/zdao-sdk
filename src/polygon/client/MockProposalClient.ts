import { ethers } from 'ethers';

import { AbstractProposalClient } from '../../client';
import {
  Choice,
  NotImplementedError,
  Proposal,
  ProposalProperties,
  Vote,
} from '../../types';
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
    choice: Choice
  ): Promise<void> {
    const address = account;
    const found = this._votes.find((item) => item.voter == address);

    const vp = Number(await this.getVotingPowerOfUser(account));
    if (!found) {
      this._votes.push({
        voter: address,
        choice,
        votes: vp.toString(),
      });
      this._properties.voters = (this._properties.voters ?? 0) + vp;
    } else {
      found.choice = choice;
    }
    if (this._properties.scores) {
      this._properties.scores[choice] = (
        Number(this._properties.scores) + vp
      ).toString();
    }
  }

  calculate(_: ethers.Signer): Promise<void> {
    throw new NotImplementedError();
  }

  execute(_: ethers.Signer): Promise<void> {
    throw new NotImplementedError();
  }

  getCheckPointingHashes(): Promise<string[]> {
    throw new NotImplementedError();
  }
}

export default MockProposalClient;
