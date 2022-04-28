import { ethers } from 'ethers';

import { ProposalProperties } from '../types';
import { Choice, Vote } from '../types';
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
    if (!polyZDAO) throw new Error(errorMessageForError('not-sync-state'));

    const count = 30000;
    let from = 0;
    let numberOfResults = count;
    const votes: Vote[] = [];
    while (numberOfResults === count) {
      const results = await polyZDAO.listVoters(this.id, from, from + count);
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
    if (!polyZDAO) throw new Error(errorMessageForError('not-sync-state'));

    return (await polyZDAO.votingPowerOfVoter(account)).toNumber();
  }

  async vote(signer: ethers.Wallet, choice: Choice) {
    const daoId = this._zDAO.id;
    const proposalId = this.id;
    await this._zDAO.polyZDAOChef.vote(signer, daoId, proposalId, choice);
  }

  async execute(
    signer: ethers.Wallet
  ): Promise<ethers.providers.TransactionResponse> {
    const isOwner = await this._zDAO.gnosisSafeClient.isOwnerAddress(
      signer,
      this._zDAO.gnosisSafe,
      signer.address
    );
    if (!isOwner) {
      throw new Error(errorMessageForError('not-gnosis-owner'));
    }

    if (!this.metadata) {
      throw new Error(errorMessageForError('empty-metadata'));
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
