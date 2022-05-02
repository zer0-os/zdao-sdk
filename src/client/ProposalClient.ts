import { ethers } from 'ethers';

import { ProposalProperties } from '../types';
import { Choice, Vote } from '../types';
import { NotSyncStateError, ZDAOError } from '../types/error';
import { errorMessageForError } from '../utilities/messages';
import AbstractProposalClient from './AbstractProposalClient';
import DAOClient from './DAOClient';

class ProposalClient extends AbstractProposalClient {
  private readonly _zDAO: DAOClient;

  constructor(properties: ProposalProperties, zDAO: DAOClient) {
    super(properties);
    this._zDAO = zDAO;
  }

  async listVotes(): Promise<Vote[]> {
    const polyZDAO = await this._zDAO.getPolyZDAO();
    if (!polyZDAO) {
      throw new NotSyncStateError();
    }

    const { voters } = await polyZDAO.votesResultOfProposal(this.id);

    const count = voters.toNumber();
    const limit = 30000;
    let from = 1;
    let numberOfResults = limit;
    const votes: Vote[] = [];

    while (numberOfResults === limit) {
      const results = await polyZDAO.listVoters(
        this.id,
        from,
        Math.min(from + limit - 1, count)
      );
      votes.push(
        ...[...Array(results.voters.length).keys()].map((index: number) => ({
          voter: results.voters[index],
          choice: results.choices[index].toNumber() as Choice,
          votes: results.votes[index].toNumber(),
        }))
      );
      from += results.length;
      numberOfResults = results.length;
    }
    return votes;
  }

  async getVotingPowerOfUser(account: string): Promise<number> {
    const polyZDAO = await this._zDAO.getPolyZDAO();
    if (!polyZDAO) {
      throw new NotSyncStateError();
    }

    return (await polyZDAO.votingPowerOfVoter(this.id, account)).toNumber();
  }

  async vote(signer: ethers.Wallet, choice: Choice) {
    const daoId = this._zDAO.id;
    const proposalId = this.id;
    return await this._zDAO.polyZDAOChef.vote(
      signer,
      daoId,
      proposalId,
      choice
    );
  }

  async collect(signer: ethers.Wallet) {
    const daoId = this._zDAO.id;
    const proposalId = this.id;

    return await this._zDAO.polyZDAOChef.collectResult(
      signer,
      daoId,
      proposalId
    );
  }

  async execute(signer: ethers.Wallet) {
    const isOwner = await this._zDAO.gnosisSafeClient.isOwnerAddress(
      signer,
      this._zDAO.gnosisSafe,
      signer.address
    );
    if (!isOwner) {
      throw new ZDAOError(errorMessageForError('not-gnosis-owner'));
    }

    if (!this.metadata) {
      throw new ZDAOError(errorMessageForError('empty-metadata'));
    }

    if (!this.metadata?.token || this.metadata.token.length < 1) {
      // Ether transfer
      return await this._zDAO.gnosisSafeClient.transferEther(
        this._zDAO.gnosisSafe,
        signer,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.metadata!.recipient,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.metadata!.amount.toString()
      );
    } else {
      // ERC20 transfer
      return await this._zDAO.gnosisSafeClient.transferERC20(
        this._zDAO.gnosisSafe,
        signer,
        this.metadata.token,
        this.metadata.recipient,
        this.metadata.amount.toString()
      );
    }
  }
}

export default ProposalClient;
