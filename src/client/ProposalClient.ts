import { BigNumber, ethers } from 'ethers';

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

  async vote(signer: ethers.Wallet, choice: Choice) {
    const polyZDAO = await this._zDAO.getPolyZDAO();
    if (!polyZDAO) {
      throw new NotSyncStateError();
    }

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

    return await this._zDAO.polyZDAOChef.collectProposal(
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

  canExecute(): boolean {
    if (!this.scores || !this.voters) return false;
    if (this.state !== 'collected') return false;

    const yes = BigNumber.from(this.scores[0]),
      no = BigNumber.from(this.scores[1]),
      zero = BigNumber.from(0);
    if (
      this.voters < this._zDAO.quorumParticipants ||
      yes.add(no).lt(BigNumber.from(this._zDAO.quorumVotes)) // <
    ) {
      return false;
    }

    // if relative majority, the denominator should be sum of yes and no votes
    if (
      this._zDAO.isRelativeMajority &&
      yes.add(no).gt(zero) &&
      yes
        .mul(BigNumber.from(10000))
        .div(yes.add(no))
        .gte(BigNumber.from(this._zDAO.threshold))
    ) {
      return true;
    }

    // if absolute majority, the denominator should be total supply
    if (
      !this._zDAO.isRelativeMajority &&
      this._zDAO.totalSupply.gt(zero) &&
      yes
        .mul(10000)
        .div(this._zDAO.totalSupply)
        .gte(BigNumber.from(this._zDAO.threshold))
    ) {
      return true;
    }
    return false;
  }

  collectTxHash(): Promise<string[]> {
    return this._zDAO.polyZDAOChef.collectTxHash(this._zDAO.id, this.id);
  }
}

export default ProposalClient;
