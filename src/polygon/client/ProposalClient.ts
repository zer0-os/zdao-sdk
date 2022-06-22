import { ethers } from 'ethers';

import { AbstractProposalClient } from '../../client';
import {
  AlreadyDestroyedError,
  CalculateProposalParams,
  Choice,
  ExecuteProposalParams,
  FailedTxError,
  FinalizeProposalParams,
  InvalidError,
  NotSyncStateError,
  Proposal,
  ProposalProperties,
  ProposalState,
  Vote,
  VoteProposalParams,
  ZDAOError,
} from '../../types';
import { errorMessageForError } from '../../utilities';
import { FinalizeProposalParamsOptions, ZDAOOptions } from '../types';
import DAOClient from './DAOClient';
import GlobalClient from './GlobalClient';
import ProofClient from './ProofClient';

class ProposalClient extends AbstractProposalClient {
  private readonly _zDAO: DAOClient;

  private constructor(properties: ProposalProperties, zDAO: DAOClient) {
    super(properties);
    this._zDAO = zDAO;
  }

  static async createInstance(
    zDAO: DAOClient,
    properties: ProposalProperties
  ): Promise<Proposal> {
    const proposal = new ProposalClient(
      {
        ...properties,
        metadata: await AbstractProposalClient.getTokenMetadata(
          GlobalClient.ipfsGateway,
          properties.ipfs
        ),
      },
      zDAO
    );
    return proposal;
  }

  async listVotes(): Promise<Vote[]> {
    const polygonZDAO = await this._zDAO.getPolygonZDAO();
    if (!polygonZDAO) {
      throw new NotSyncStateError();
    }

    const count = 30000;
    let from = 0;
    let numberOfResults = count;
    const votes: Vote[] = [];

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
    const polygonZDAO = await this._zDAO.getPolygonZDAO();
    if (!polygonZDAO) {
      throw new NotSyncStateError();
    }

    return (await polygonZDAO.votingPowerOfVoter(this.id, account)).toString();
  }

  async updateScoresAndVotes(): Promise<Proposal> {
    const polygonZDAO = await this._zDAO.getPolygonZDAO();
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
    this._properties.scores = scores;
    this._properties.voters = voters;

    return this;
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    payload: VoteProposalParams
  ) {
    // zDAO should be active
    if (this._zDAO.destroyed) {
      throw new AlreadyDestroyedError();
    }

    // zDAO should be synchronized to Polygon prior to create proposal
    const polygonZDAO = await this._zDAO.getPolygonZDAO();
    if (!polygonZDAO) {
      throw new NotSyncStateError();
    }

    if (this.state !== ProposalState.ACTIVE) {
      throw new InvalidError(errorMessageForError('not-active-proposal'));
    }

    const sp = await GlobalClient.staking.pastStakingPower(
      account,
      (this._zDAO.options as ZDAOOptions).polygonToken.token,
      this.snapshot!
    );
    if (ethers.BigNumber.from(sp).eq(ethers.BigNumber.from(0))) {
      throw new InvalidError(errorMessageForError('zero-voting-power'));
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const signer = provider?.getSigner ? provider.getSigner() : provider;

      const daoId = this._zDAO.id;
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

  async calculate(signer: ethers.Signer, _: CalculateProposalParams) {
    const daoId = this._zDAO.id;
    const proposalId = this.id;

    try {
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

  async finalize(signer: ethers.Signer, payload: FinalizeProposalParams) {
    // zDAO should be active
    if (this._zDAO.destroyed) {
      throw new AlreadyDestroyedError();
    }

    try {
      const proof = await ProofClient.generate(
        (payload.options as FinalizeProposalParamsOptions).txHash
      );
      await GlobalClient.ethereumZDAOChef.receiveMessage(signer, proof);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async execute(signer: ethers.Signer, _: ExecuteProposalParams) {
    const address = await signer.getAddress();
    const isOwner = await this._zDAO.gnosisSafeClient.isOwnerAddress(
      signer,
      this._zDAO.gnosisSafe,
      address
    );
    if (!isOwner) {
      throw new ZDAOError(errorMessageForError('not-gnosis-owner'));
    }

    if (!this.metadata) {
      throw new ZDAOError(errorMessageForError('empty-metadata'));
    }

    try {
      if (!this.metadata?.token || this.metadata.token.length < 1) {
        // Ether transfer
        await this._zDAO.gnosisSafeClient.transferEther(
          this._zDAO.gnosisSafe,
          signer,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.metadata!.recipient,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.metadata!.amount.toString()
        );
      } else {
        // ERC20 transfer
        await this._zDAO.gnosisSafeClient.transferERC20(
          this._zDAO.gnosisSafe,
          signer,
          this.metadata.token,
          this.metadata.recipient,
          this.metadata.amount.toString()
        );
      }

      const daoId = this._zDAO.id;
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
          this._zDAO.id,
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
