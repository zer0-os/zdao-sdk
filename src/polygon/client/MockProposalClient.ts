import { BigNumber, ethers } from 'ethers';

import { AbstractProposalClient } from '../../client';
import { NotImplementedError, ProposalProperties } from '../../types';
import { getSigner } from '../../utilities';
import {
  CalculatePolygonProposalParams,
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
  private readonly zDAO: MockDAOClient;
  private votes: PolygonVote[] = [];

  constructor(properties: ProposalProperties, zDAO: MockDAOClient) {
    super(properties);
    this.zDAO = zDAO;
  }

  canExecute(): boolean {
    if (!this.scores || !this.voters) return false;

    const sumOfScores = this.scores.reduce(
      (prev, current) => prev.add(current),
      BigNumber.from(0)
    );
    const zero = BigNumber.from(0);
    if (
      this.voters < this.zDAO.minimumVotingParticipants ||
      sumOfScores.lt(BigNumber.from(this.zDAO.minimumTotalVotingTokens)) // <
    ) {
      return false;
    }

    // if relative majority, the denominator should be sum of yes and no votes
    if (
      this.zDAO.isRelativeMajority &&
      sumOfScores.gt(zero) &&
      BigNumber.from(this.scores[0])
        .mul(BigNumber.from(10000))
        .div(sumOfScores)
        .gte(BigNumber.from(this.zDAO.votingThreshold))
    ) {
      return true;
    }

    const totalSupply = BigNumber.from(this.zDAO.totalSupplyOfVotingToken);

    // if absolute majority, the denominator should be total supply
    if (
      !this.zDAO.isRelativeMajority &&
      totalSupply.gt(zero) &&
      BigNumber.from(this.scores[0])
        .mul(10000)
        .div(totalSupply)
        .gte(BigNumber.from(this.zDAO.votingThreshold))
    ) {
      return true;
    }
    return false;
  }

  listVotes(): Promise<PolygonVote[]> {
    return Promise.resolve(this.votes);
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
    const found = this.votes.find((item) => item.voter == accountAddress);

    const vp = Number(await this.getVotingPowerOfUser(accountAddress));
    if (!found) {
      this.votes.push({
        voter: accountAddress,
        choice: payload.choice,
        votes: vp.toString(),
      });
      this.properties.voters = (this.properties.voters ?? 0) + vp;
    } else {
      found.choice = payload.choice;
    }
    if (this.properties.scores) {
      this.properties.scores[payload.choice] = (
        Number(this.properties.scores) + vp
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

  getCheckPointingHashes(): Promise<string[]> {
    throw new NotImplementedError();
  }
}

export default MockProposalClient;
