import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import {
  CalculateProposalParams,
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
  protected readonly properties: ProposalProperties;

  constructor(properties: ProposalProperties) {
    this.properties = cloneDeep(properties);
  }

  get id() {
    return this.properties.id;
  }

  get createdBy() {
    return this.properties.createdBy;
  }

  get title() {
    return this.properties.title;
  }

  get body() {
    return this.properties.body;
  }

  get ipfs() {
    return this.properties.ipfs;
  }

  get choices() {
    return this.properties.choices;
  }

  get created() {
    return this.properties.created;
  }

  get start() {
    return this.properties.start;
  }

  get end() {
    return this.properties.end;
  }

  get state() {
    return this.properties.state;
  }

  get snapshot() {
    return this.properties.snapshot;
  }

  get scores() {
    return this.properties.scores;
  }

  get voters() {
    return this.properties.voters;
  }

  get metadata() {
    return this.properties.metadata;
  }

  canExecute(): boolean {
    throw new NotImplementedError();
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
}

export default AbstractProposalClient;
