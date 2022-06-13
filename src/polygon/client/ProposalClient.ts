import { ethers } from 'ethers';

import {
  AlreadyDestroyedError,
  Choice,
  FailedTxError,
  InvalidError,
  NotSyncStateError,
  ProposalProperties,
  ProposalState,
  Vote,
  ZDAOError,
} from '../../types';
import { errorMessageForError } from '../../utilities';
import { ZDAOOptions } from '../types';
import AbstractProposalClient from './AbstractProposalClient';
import DAOClient from './DAOClient';
import GlobalClient from './GlobalClient';

class ProposalClient extends AbstractProposalClient {
  private readonly _zDAO: DAOClient;

  constructor(properties: ProposalProperties, zDAO: DAOClient) {
    super(properties);
    this._zDAO = zDAO;
  }

  async listVotes(): Promise<Vote[]> {
    const childZDAO = await this._zDAO.getChildZDAO();
    if (!childZDAO) {
      throw new NotSyncStateError();
    }

    const count = 30000;
    let from = 0;
    let numberOfResults = count;
    const votes: Vote[] = [];

    while (numberOfResults === count) {
      const results = await childZDAO.listVoters(this.id, from, count);

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
    const childZDAO = await this._zDAO.getChildZDAO();
    if (!childZDAO) {
      throw new NotSyncStateError();
    }

    return (await childZDAO.votingPowerOfVoter(this.id, account)).toString();
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    choice: Choice
  ) {
    // zDAO should be active
    if (this._zDAO.destroyed) {
      throw new AlreadyDestroyedError();
    }

    // zDAO should be synchronized to Polygon prior to create proposal
    const childZDAO = await this._zDAO.getChildZDAO();
    if (!childZDAO) {
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
      await GlobalClient.childZDAOChef.vote(signer, daoId, proposalId, choice);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async calculate(signer: ethers.Signer) {
    const daoId = this._zDAO.id;
    const proposalId = this.id;

    try {
      await GlobalClient.childZDAOChef.calculateProposal(
        signer,
        daoId,
        proposalId
      );
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async execute(signer: ethers.Signer) {
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
      await GlobalClient.rootZDAOChef.executeProposal(
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
        return GlobalClient.childZDAOChef.getCheckPointingHashes(
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
