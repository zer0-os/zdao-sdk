import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import {
  CalculateProposalParams,
  ExecuteProposalParams,
  FinalizeProposalParams,
  NotImplementedError,
  Proposal,
  ProposalProperties,
  TokenMetaData,
  Vote,
  VoteProposalParams,
} from '../types';
import { errorMessageForError } from '../utilities';
import IPFSClient from './IPFSClient';

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

  protected static async getTokenMetadata(
    ipfsGateway: string,
    ipfs: string
  ): Promise<TokenMetaData | undefined> {
    try {
      if (!ipfs) return undefined;

      const ipfsData = await IPFSClient.getJson(ipfs, ipfsGateway);
      if (!ipfsData.data || !ipfsData.data.message) {
        throw new Error(errorMessageForError('empty-voting-token'));
      }

      const metadataJson = JSON.parse(ipfsData.data.message.metadata);
      if (
        !metadataJson.sender ||
        !metadataJson.recipient ||
        !metadataJson.token ||
        !metadataJson.amount
      ) {
        return undefined;
      }

      const abi = metadataJson.abi;
      const sender = metadataJson.sender;
      const recipient = metadataJson.recipient;
      const token = metadataJson.token;
      const decimals = metadataJson.decimals ?? 18;
      const symbol = metadataJson.symbol ?? 'zToken';
      const amount = metadataJson.amount;

      return {
        abi,
        sender,
        recipient,
        token,
        decimals,
        symbol,
        amount,
      };
    } catch (error) {
      return undefined;
    }
  }

  listVotes(): Promise<Vote[]> {
    throw new NotImplementedError();
  }

  getVotingPowerOfUser(_: string): Promise<string> {
    throw new NotImplementedError();
  }

  updateScoresAndVotes(): Promise<Proposal> {
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
