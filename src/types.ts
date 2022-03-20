import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ethers } from 'ethers';

import { SupportedChainId } from './config';
import { Asset, Transaction } from './gnosis-safe/types';
import {
  Proposal,
  ProposalDetail,
  ProposalResult,
  TokenMetaData,
  Vote,
  zDAO,
} from './snapshot-io/types';

export interface SnapshotConfig {
  // uri to Snaphost Hub
  serviceUri: string;
  // ipfs gateway
  ipfsGateway: string;
}

export interface GnosisSafeConfig {
  // uri to Gnosis Safe service
  serviceUri: string;
  // uri to Gnosis Safe gateway
  gateway: string;
}

export interface zNAConfig {
  // address to zDAOCore contract
  contract: string;
  // web3 provider
  provider: ethers.providers.Provider;
}

export interface Config {
  snapshot: SnapshotConfig;
  gnosisSafe: GnosisSafeConfig;
  zNA: zNAConfig;
}

export type zNA = string;
export type zDAOId = string;

export interface CreateZDAODto {
  // zNA
  zNA: zNA;
  // zDAO title
  title: string;
  // address to zDAO creator
  creator: string;
  // uri to avatar
  avatar?: string;
  // network id where zDAO was created
  network: SupportedChainId;
  // adress to Gnosis Safe
  safeAddress: string;
  // addresses to Gnosis Safe owners
  owners: string[];
  // ERC20 token address to cast a vote
  votingToken: string;
}

export interface zDAOAssets {
  // total asset amount in USD
  amountInUSD: number;
  // list of assets in zDAO
  assets: Asset[];
}

export interface CreateProposalDto {
  title: string;
  body?: string;
  duration: number; // time duration from start to end in seconds
  snapshot: number; // block number
  transfer: TokenMetaData;
}

export interface VoteProposalDto {
  proposal: string; // proposal id
  proposalType: string; // only used for snapshot, @todo
  choice: 1 | 2; // Yes or No
}

export interface ExecuteProposalDto {
  proposal: string; // proposal id
}

export interface SDKInstance {
  /**
   * Get all the list of zNA
   * @returns list of zNA
   */
  listZNA(): Promise<zNA[]>;

  /**
   * Create an zDAO instance by zNA
   * @param zNA zNA address
   * @returns created zDAO instance
   * @exception throw Error if zNA does not exist
   */
  getZDAOByZNA(zNA: zNA): Promise<ZDAOInstance>;

  /**
   * Check if zDAO exists
   * @param zNA zNA address
   * @returns true if zNA exists
   */
  doesZDAOExist(zNA: zNA): Promise<boolean>;

  /**
   * Create zDAO from parameters for test
   * @param packaged parameters of zDAO
   * @exception throw Error if zNA already exists
   * @exception throw Error if owners is empty
   * @exception throw Error if title is empty
   */
  createZDAOFromParams(param: CreateZDAODto): Promise<void>;
}

export interface ZDAOInstance {
  /**
   * Get zDAO
   * @returns zDAO structure
   */
  getZDAO(): zDAO;

  /**
   * Get the list of zDAO assets and amount in USD
   * @returns assets in zDAO
   */
  listAssets(): Promise<zDAOAssets>;

  /**
   * Get the list of zDAO transactions
   * @returns list of transactions
   */
  listTransactions(): Promise<Transaction[]>;

  /**
   * Get the list of the proposals created in the zDAO
   * @param from start index
   * @param count number of proposals to fetch
   * @return list of proposals
   */
  listProposals(from: number, count: number): Promise<Proposal[]>;

  /**
   * Get proposal detail by proposal id
   * @param proposalId proposal id
   * @return proposal detail
   */
  getProposalDetail(proposalId: string): Promise<ProposalDetail>;

  /**
   * Get all the votes by proposal id filtering with the function parameter
   * @param proposalId proposal id
   * @param from start index
   * @param count voting count to fetch
   * @param voter voter address to filter
   * @returns list of votes
   */
  getProposalVotes(
    proposalId: string,
    from: number,
    count: number,
    voter: string
  ): Promise<Vote[]>;

  /**
   * Get the result of proposal from votes
   * @param proposal proposal information
   * @param votes list of votes to calculate result
   * @returns summarized voting result
   */
  getProposalResults(
    proposal: ProposalDetail,
    votes: Vote[]
  ): Promise<ProposalResult>;

  /**
   * Get voting power of the user in zDAO
   * @param account account address
   * @param proposal proposal information
   * @returns voting power as number
   */
  getVotingPower(account: string, proposal: ProposalDetail): Promise<number>;

  /**
   * Create a proposal in zDAO
   * @param signer signer wallet
   * @param payload packaged parameters to create a proposal
   * @returns proposal id if success
   */
  createProposal(
    signer: ethers.Wallet,
    payload: CreateProposalDto
  ): Promise<string>;

  /**
   * Cast a vote on proposal
   * @param signer signer wallet
   * @param payload packaged paramters to cast a vote
   * @returns vote id if successfully cast a vote
   */
  voteProposal(
    signer: ethers.Wallet,
    payload: VoteProposalDto
  ): Promise<string>;

  /**
   * Execute a proposal in zDAO
   * @param signer signer wallet
   * @param payload packaged parameters to execute a proposal
   * @returns transaction response
   * @exception throw Error if signer is not Gnosis Safe owner
   * @exception throw Error if proposal does not conain meta data to transfer tokens
   */
  executeProposal(
    signer: ethers.Wallet,
    payload: ExecuteProposalDto
  ): Promise<TransactionResponse>;
}

// // @feedback: consider adding a function `createZDAOFromParams`

// // Just so you can test without zNA => zDAO lookup
// // export const getZDAO = (zNA: string, snapshotSpace: string, otherprams: any) => zDAO;
