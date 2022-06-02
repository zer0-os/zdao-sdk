import { BigNumber, ContractReceipt, Signer } from 'ethers';

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

  async vote(signer: Signer, choice: Choice): Promise<ContractReceipt> {
    const address = await signer.getAddress();
    const found = this._votes.find((item) => item.voter == address);
    if (!found) {
      this._votes.push({
        voter: address,
        choice,
        votes: '1',
      });
      return Promise.resolve(this.makeContractReceipt());
    }
    found.choice = choice;
    return Promise.resolve(this.makeContractReceipt());
  }

  calculate(_: Signer): Promise<ContractReceipt> {
    throw new NotImplementedError();
  }

  execute(_: Signer): Promise<ContractReceipt> {
    throw new NotImplementedError();
  }

  getCheckPointingHashes(): Promise<string[]> {
    throw new NotImplementedError();
  }
}

export default MockProposalClient;
