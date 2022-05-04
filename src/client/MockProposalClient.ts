import { BigNumber, ContractReceipt, ethers } from 'ethers';

import { Choice, ProposalProperties, Vote } from '../types';
import { NotImplementedError } from '../types/error';
import AbstractProposalClient from './AbstractProposalClient';
import MockDAOClient from './MockDAOClient';

class MockProposalClient extends AbstractProposalClient {
  private _votes: Vote[] = [];
  private readonly _zDAO: MockDAOClient;

  constructor(properties: ProposalProperties, zDAO: MockDAOClient) {
    super(properties);
    this._zDAO = zDAO;
  }

  listVotes(): Promise<Vote[]> {
    return Promise.resolve(this._votes);
  }

  getVotingPowerOfUser(_: string): Promise<string> {
    return Promise.resolve('1');
  }

  private makeContractReceipt(): ContractReceipt {
    // make empty ContractReceipt to sync interface
    return {
      to: 'to',
      from: 'from',
      contractAddress: 'contractAddress',
      transactionIndex: new Date().getTime(),
      gasUsed: BigNumber.from(0),
      logsBloom: '',
      blockHash: BigNumber.from(new Date().getTime()).toHexString(),
      transactionHash: BigNumber.from(new Date().getTime()).toHexString(),
      logs: [],
      blockNumber: new Date().getTime(),
      confirmations: 1,
      cumulativeGasUsed: BigNumber.from(0),
      effectiveGasPrice: BigNumber.from(0),
      byzantium: false,
      type: 0,
    };
  }

  vote(signer: ethers.Wallet, choice: Choice): Promise<ContractReceipt> {
    const found = this._votes.find((item) => item.voter == signer.address);
    if (!found) {
      this._votes.push({
        voter: signer.address,
        choice,
        votes: '1',
      });
      return Promise.resolve(this.makeContractReceipt());
    }
    found.choice = choice;
    return Promise.resolve(this.makeContractReceipt());
  }

  collect(_: ethers.Wallet): Promise<ContractReceipt> {
    throw new NotImplementedError();
  }

  execute(_: ethers.Wallet): Promise<ContractReceipt> {
    throw new NotImplementedError();
  }

  canExecute(): boolean {
    if (!this.scores || !this.voters) return false;

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
    throw new NotImplementedError();
  }
}

export default MockProposalClient;
