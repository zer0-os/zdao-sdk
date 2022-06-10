import { ContractReceipt, ethers } from 'ethers';

import {
  Choice,
  NotImplementedError,
  ProposalProperties,
  Vote,
} from '../../types';
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
      gasUsed: ethers.BigNumber.from(0),
      logsBloom: '',
      blockHash: ethers.BigNumber.from(new Date().getTime()).toHexString(),
      transactionHash: ethers.BigNumber.from(
        new Date().getTime()
      ).toHexString(),
      logs: [],
      blockNumber: new Date().getTime(),
      confirmations: 1,
      cumulativeGasUsed: ethers.BigNumber.from(0),
      effectiveGasPrice: ethers.BigNumber.from(0),
      byzantium: false,
      type: 0,
    };
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    choice: Choice
  ): Promise<void> {
    const address = account;
    const found = this._votes.find((item) => item.voter == address);
    if (!found) {
      this._votes.push({
        voter: address,
        choice,
        votes: '1',
      });
    } else {
      found.choice = choice;
    }
  }

  calculate(_: ethers.Signer): Promise<void> {
    throw new NotImplementedError();
  }

  execute(_: ethers.Signer): Promise<void> {
    throw new NotImplementedError();
  }

  getCheckPointingHashes(): Promise<string[]> {
    throw new NotImplementedError();
  }
}

export default MockProposalClient;
