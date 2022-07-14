import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import {
  CalculateProposalParams,
  ExecuteProposalParams,
  FinalizeProposalParams,
  NotImplementedError,
  Proposal,
  ProposalProperties,
  Vote,
  VoteProposalParams,
} from '../types';

abstract class AbstractProposalClient<VoteT extends Vote>
  implements Proposal<VoteT>
{
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

  listVotes(): Promise<VoteT[]> {
    throw new NotImplementedError();
  }

  getVotingPowerOfUser(_: string): Promise<string> {
    throw new NotImplementedError();
  }

  updateScoresAndVotes(): Promise<Proposal<VoteT>> {
    throw new NotImplementedError();
  }

  vote(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string,
    _3: VoteProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  calculate(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: CalculateProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  finalize(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: FinalizeProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  execute(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: ExecuteProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }
}

export default AbstractProposalClient;
