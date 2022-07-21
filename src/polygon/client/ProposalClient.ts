import { ethers } from 'ethers';

import { AbstractProposalClient } from '../../client';
import {
  AlreadyDestroyedError,
  Choice,
  FailedTxError,
  InvalidError,
  NotSyncStateError,
  ProposalProperties,
  ProposalState,
  ZDAOError,
} from '../../types';
import { errorMessageForError, getSigner } from '../../utilities';
import {
  CalculatePolygonProposalParams,
  ExecutePolygonProposalParams,
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

  async listVotes(): Promise<PolygonVote[]> {
    const polygonZDAO = await this.zDAO.getPolygonZDAOContract();
    if (!polygonZDAO) {
      throw new NotSyncStateError();
    }

    const count = 30000;
    let from = 0;
    let numberOfResults = count;
    const votes: PolygonVote[] = [];

    while (numberOfResults === count) {
      const results = await polygonZDAO.listVoters(this.id, from, count);

      votes.push(
        ...[...Array(results.voters.length).keys()].map((index: number) => ({
          voter: results.voters[index],
          choice: results.choices[index].toNumber() as Choice,
          votes: results.votes[index].toString(),
        }))
      );
      from += results.length;
      numberOfResults = results.length;
    }
    return votes;
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

    const polyProposal = polygonZDAO
      ? await polygonZDAO.proposals(this.id)
      : null;
    const isSyncedProposal = polyProposal
      ? polyProposal.proposalId.eq(this.id)
      : false;

    const scores =
      polygonZDAO && polyProposal && isSyncedProposal
        ? [polyProposal.yes.toString(), polyProposal.no.toString()]
        : undefined;
    const voters =
      polygonZDAO && polyProposal && isSyncedProposal
        ? polyProposal.voters.toNumber()
        : undefined;
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
      this.zDAO.polygonToken!.token,
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

  async execute(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    _: ExecutePolygonProposalParams
  ) {
    const signer = getSigner(provider, account);

    const signerAccount = account ?? (await signer.getAddress());
    const isOwner = await this.zDAO.gnosisSafeClient.isOwnerAddress(
      signer,
      this.zDAO.gnosisSafe,
      signerAccount
    );
    if (!isOwner) {
      throw new ZDAOError(errorMessageForError('not-gnosis-owner'));
    }

    if (!this.metadata) {
      throw new ZDAOError(errorMessageForError('empty-metadata'));
    }
    if (this.state !== ProposalState.AWAITING_EXECUTION) {
      throw new ZDAOError(errorMessageForError('not-executable-proposal'));
    }

    try {
      if (!this.metadata?.token || this.metadata.token.length < 1) {
        // Ether transfer
        await this.zDAO.gnosisSafeClient.transferEther(
          this.zDAO.gnosisSafe,
          signer,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.metadata!.recipient,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.metadata!.amount.toString()
        );
      } else {
        // ERC20 transfer
        await this.zDAO.gnosisSafeClient.transferERC20(
          this.zDAO.gnosisSafe,
          signer,
          this.metadata.token,
          this.metadata.recipient,
          this.metadata.amount.toString()
        );
      }

      const daoId = this.zDAO.id;
      const proposalId = this.id;
      await GlobalClient.ethereumZDAOChef.executeProposal(
        signer,
        daoId,
        proposalId
      );
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
