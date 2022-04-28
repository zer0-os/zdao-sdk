import { ethers } from 'ethers';

import { Choice, ProposalProperties, Vote } from '../types';
import { NotImplementedError } from '../types/error';
import AbstractProposalClient from './AbstractProposalClient';

class MockProposalClient extends AbstractProposalClient {
  private _votes: Vote[] = [];

  constructor(properties: ProposalProperties) {
    super(properties);
  }

  listVotes(): Promise<Vote[]> {
    return Promise.resolve(this._votes);
  }

  getVotingPowerOfUser(_: string): Promise<number> {
    return Promise.resolve(1);
  }

  vote(signer: ethers.Wallet, choice: Choice): Promise<void> {
    const found = this._votes.find((item) => item.voter == signer.address);
    if (!found) {
      this._votes.push({
        voter: signer.address,
        choice,
        votes: 1,
      });
      return Promise.resolve();
    }
    found.choice = choice;
    return Promise.resolve();
  }

  execute(_: ethers.Wallet): Promise<ethers.providers.TransactionResponse> {
    throw new NotImplementedError();
  }
}

export default MockProposalClient;
