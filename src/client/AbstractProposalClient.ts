import { ContractReceipt, ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import { ProposalProperties } from '../types';
import { Choice, Proposal, Vote } from '../types';
import { NotImplementedError } from '../types/error';

class AbstractProposalClient implements Proposal {
  protected readonly _properties: ProposalProperties;

  constructor(properties: ProposalProperties) {
    this._properties = cloneDeep(properties);
  }

  get id() {
    return this._properties.id;
  }

  get createdBy() {
    return this._properties.createdBy;
  }

  get title() {
    return this._properties.title;
  }

  get body() {
    return this._properties.body;
  }

  get ipfs() {
    return this._properties.ipfs;
  }

  get choices() {
    return this._properties.choices;
  }

  get start() {
    return this._properties.start;
  }

  get end() {
    return this._properties.end;
  }

  get state() {
    return this._properties.state;
  }

  get snapshot() {
    return this._properties.snapshot;
  }

  get scores() {
    return this._properties.scores;
  }

  get voters() {
    return this._properties.voters;
  }

  get metadata() {
    return this._properties.metadata;
  }

  listVotes(): Promise<Vote[]> {
    throw new NotImplementedError();
  }

  getVotingPowerOfUser(_: string): Promise<string> {
    throw new NotImplementedError();
  }

  vote(_: ethers.Wallet, _2: Choice): Promise<ContractReceipt> {
    throw new NotImplementedError();
  }

  collect(_: ethers.Wallet): Promise<ContractReceipt> {
    throw new NotImplementedError();
  }

  execute(_: ethers.Wallet): Promise<ContractReceipt> {
    throw new NotImplementedError();
  }

  canExecute(): boolean {
    throw new NotImplementedError();
  }

  collectTxHash(): Promise<string[]> {
    throw new NotImplementedError();
  }
}

export default AbstractProposalClient;
