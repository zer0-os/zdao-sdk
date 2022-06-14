import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import {
  Choice,
  NotImplementedError,
  Proposal,
  ProposalProperties,
  Vote,
} from '../types';

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

  get created() {
    return this._properties.created;
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

  vote(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string,
    _3: Choice
  ): Promise<void> {
    throw new NotImplementedError();
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

export default AbstractProposalClient;
