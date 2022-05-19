import { Signer } from 'ethers';

import { ProposalProperties } from '../types';
import { Choice, Vote } from '../types';
import { FailedTxError, NotSyncStateError, ZDAOError } from '../types/error';
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

    const count = 30000;
    let from = 0;
    let numberOfResults = count;
    const votes: Vote[] = [];

    while (numberOfResults === count) {
      const results = await polyZDAO.listVoters(this.id, from, count);

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
    const polyZDAO = await this._zDAO.getPolyZDAO();
    if (!polyZDAO) {
      throw new NotSyncStateError();
    }

    return (await polyZDAO.votingPowerOfVoter(this.id, account)).toString();
  }

  async vote(signer: Signer, choice: Choice) {
    const polyZDAO = await this._zDAO.getPolyZDAO();
    if (!polyZDAO) {
      throw new NotSyncStateError();
    }

    try {
      const daoId = this._zDAO.id;
      const proposalId = this.id;
      return await this._zDAO.polyZDAOChef.vote(
        signer,
        daoId,
        proposalId,
        choice
      );
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async collect(signer: Signer) {
    const daoId = this._zDAO.id;
    const proposalId = this.id;

    try {
      return await this._zDAO.polyZDAOChef.collectProposal(
        signer,
        daoId,
        proposalId
      );
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async execute(signer: Signer) {
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
      return await this._zDAO.etherZDAOChef.executeProposal(
        signer,
        daoId,
        proposalId
      );
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  collectTxHash(): Promise<string[]> {
    try {
      if (this.state === 'finalizing')
        return this._zDAO.polyZDAOChef.collectTxHash(this._zDAO.id, this.id);
      return Promise.resolve([]);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }
}

export default ProposalClient;
