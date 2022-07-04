import { ethers } from 'ethers';

import { AbstractProposalClient } from '../../client';
import { NotImplementedError, ProposalProperties } from '../../types';
import { getSigner } from '../../utilities';
import {
  CalculatePolygonProposalParams,
  ExecutePolygonProposalParams,
  FinalizePolygonProposalParams,
  PolygonProposal,
  PolygonVote,
  VotePolygonProposalParams,
} from '../types';
import MockDAOClient from './MockDAOClient';

class MockProposalClient
  extends AbstractProposalClient<PolygonVote>
  implements PolygonProposal
{
  private _votes: PolygonVote[] = [];
  private readonly _zDAO: MockDAOClient;

  constructor(properties: ProposalProperties, zDAO: MockDAOClient) {
    super(properties);
    this._zDAO = zDAO;
  }

  listVotes(): Promise<PolygonVote[]> {
    return Promise.resolve(this._votes);
  }

  getVotingPowerOfUser(_: string): Promise<string> {
    return Promise.resolve('1');
  }

  updateScoresAndVotes(): Promise<PolygonProposal> {
    return Promise.resolve(this);
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: VotePolygonProposalParams
  ): Promise<void> {
    const signer = getSigner(provider, account);
    const accountAddress = account ? account : await signer.getAddress();
    const found = this._votes.find((item) => item.voter == accountAddress);

    const vp = Number(await this.getVotingPowerOfUser(accountAddress));
    if (!found) {
      this._votes.push({
        voter: accountAddress,
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
    _3: CalculatePolygonProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  finalize(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: FinalizePolygonProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  execute(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: ExecutePolygonProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  getCheckPointingHashes(): Promise<string[]> {
    throw new NotImplementedError();
  }
}

export default MockProposalClient;
