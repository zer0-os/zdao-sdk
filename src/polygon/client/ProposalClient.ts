import { BigNumber, ethers } from 'ethers';

import { AbstractProposalClient } from '../../client';
import {
  AlreadyDestroyedError,
  Choice,
  FailedTxError,
  InvalidError,
  NotSyncStateError,
  ProposalProperties,
  ProposalState,
} from '../../types';
import { errorMessageForError, getSigner } from '../../utilities';
import { PolygonSubgraphVote } from '../polygon/types';
import {
  CalculatePolygonProposalParams,
  FinalizePolygonProposalParams,
  PolygonProposal,
  PolygonVote,
  VotePolygonProposalParams,
} from '../types';
import DAOClient from './DAOClient';
import GlobalClient from './GlobalClient';
import ProofClient from './ProofClient';

class ProposalClient
  extends AbstractProposalClient<PolygonVote>
  implements PolygonProposal
{
  private readonly zDAO: DAOClient;

  private constructor(properties: ProposalProperties, zDAO: DAOClient) {
    super(properties);
    this.zDAO = zDAO;
  }

  static async createInstance(
    zDAO: DAOClient,
    properties: ProposalProperties
  ): Promise<PolygonProposal> {
    const proposal = new ProposalClient(properties, zDAO);
    return proposal;
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

  async listVotes(): Promise<PolygonVote[]> {
    const subgraphVotes = await GlobalClient.polygonZDAOChef.listVotes(
      this.zDAO.id,
      this.id
    );

    return subgraphVotes.map((vote: PolygonSubgraphVote) => ({
      voter: vote.voter,
      choice: vote.choice as Choice,
      votes: vote.votingPower.toString(),
    }));
  }

  async getVotingPowerOfUser(account: string): Promise<string> {
    const polygonZDAO = await this.zDAO.getPolygonZDAOContract();
    if (!polygonZDAO) {
      throw new NotSyncStateError();
    }

    return (await polygonZDAO.votingPowerOfVoter(this.id, account)).toString();
  }

  async updateScoresAndVotes(): Promise<PolygonProposal> {
    const polygonZDAO = await this.zDAO.getPolygonZDAOContract();
    if (!polygonZDAO) {
      throw new NotSyncStateError();
    }

    const subgraphProposal = await GlobalClient.polygonZDAOChef.getProposal(
      this.zDAO.id,
      this.id
    );

    const scores = subgraphProposal?.sumOfVotes.map((vote) => vote.toString());
    const voters = subgraphProposal?.voters;
    this.properties.scores = scores;
    this.properties.voters = voters;

    return this;
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: VotePolygonProposalParams
  ) {
    // zDAO should be active
    if (this.zDAO.destroyed) {
      throw new AlreadyDestroyedError();
    }

    // zDAO should be synchronized to Polygon prior to create proposal
    const polygonZDAO = await this.zDAO.getPolygonZDAOContract();
    if (!polygonZDAO) {
      throw new NotSyncStateError();
    }

    if (this.state !== ProposalState.ACTIVE) {
      throw new InvalidError(errorMessageForError('not-active-proposal'));
    }

    const signer = getSigner(provider, account);
    const accountAddress = account ? account : await signer.getAddress();

    const sp = await GlobalClient.staking.pastStakingPower(
      accountAddress,
      this.zDAO.polygonToken.token,
      this.snapshot!
    );
    if (ethers.BigNumber.from(sp).eq(ethers.BigNumber.from(0))) {
      throw new InvalidError(errorMessageForError('zero-voting-power'));
    }

    try {
      const daoId = this.zDAO.id;
      const proposalId = this.id;
      await GlobalClient.polygonZDAOChef.vote(
        signer,
        daoId,
        proposalId,
        payload.choice
      );
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async calculate(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    _: CalculatePolygonProposalParams
  ) {
    const daoId = this.zDAO.id;
    const proposalId = this.id;

    try {
      const signer = getSigner(provider, account);

      await GlobalClient.polygonZDAOChef.calculateProposal(
        signer,
        daoId,
        proposalId
      );
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async finalize(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: FinalizePolygonProposalParams
  ) {
    // zDAO should be active
    if (this.zDAO.destroyed) {
      throw new AlreadyDestroyedError();
    }

    try {
      const signer = getSigner(provider, account);

      const proof = await ProofClient.generate(payload.txHash);
      await GlobalClient.ethereumZDAOChef.receiveMessage(signer, proof);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  getCheckPointingHashes(): Promise<string[]> {
    try {
      if (this.state === ProposalState.AWAITING_FINALIZATION)
        return GlobalClient.polygonZDAOChef.getCheckPointingHashes(
          this.zDAO.id,
          this.id
        );
      return Promise.resolve([]);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }
}

export default ProposalClient;
