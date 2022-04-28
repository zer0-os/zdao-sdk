import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import { ProposalProperties } from '../types';
import { Choice, Proposal, Vote } from '../types';
import { errorMessageForError } from '../utilities/messages';

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
    throw new Error(errorMessageForError('not-implemented'));
  }

  getVotingPowerOfUser(_: string): Promise<number> {
    throw new Error(errorMessageForError('not-implemented'));
  }

  vote(_: ethers.Wallet, _2: Choice): Promise<void> {
    throw new Error(errorMessageForError('not-implemented'));
  }

  execute(_: ethers.Wallet): Promise<ethers.providers.TransactionResponse> {
    throw new Error(errorMessageForError('not-implemented'));
  }
}

export default AbstractProposalClient;
