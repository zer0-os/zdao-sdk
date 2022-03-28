import { ethers } from 'ethers';

import { CreateProposalParams, CreateZDAOParams } from './params';
import { Choice, ProposalId, VoteId, zNA } from './primitives';
import {
  ProposalProperties,
  TokenMetaData,
  Transaction,
  Vote,
  zDAOAssets,
  zDAOProperties,
} from './structures';

export interface SDKInstance {
  /**
   * Get all the list of zNA
   * @returns list of zNA
   */
  listZNAs(): Promise<zNA[]>;

  /**
   * Create an zDAO instance by zNA
   * @param zNA zNA address
   * @returns created zDAO instance
   * @exception throw Error if zNA does not exist
   */
  getZDAOByZNA(zNA: zNA): Promise<zDAO>;

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
  createZDAOFromParams(param: CreateZDAOParams): Promise<zDAO>;
}

export interface zDAO extends zDAOProperties {
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
   * @return list of proposals
   */
  listProposals(): Promise<Proposal[]>;

  /**
   * Get the specific proposal
   * @param id proposal id
   * @returns proposal instance
   * @exception throw Error if not exist proposal id
   */
  getProposal(id: ProposalId): Promise<Proposal>;

  /**
   * Create a proposal in zDAO
   * @param signer signer wallet
   * @param payload packaged parameters to create a proposal
   * @returns proposal id if success
   */
  createProposal(
    signer: ethers.Wallet,
    payload: CreateProposalParams
  ): Promise<Proposal>;
}

export interface Proposal extends ProposalProperties {
  /**
   * Get token meta data from ipfs
   * @returns transaction meta data
   */
  getTokenMetadata(): Promise<TokenMetaData>;

  /**
   * Get all the votes by proposal id filtering with the function parameter
   * @returns list of votes
   */
  listVotes(): Promise<Vote[]>;

  /**
   * Get voting power of the user in zDAO
   * @param account account address
   * @returns voting power as number
   */
  getVotingPowerOfUser(account: string): Promise<number>;

  /**
   * Cast a vote on proposal
   * @param signer signer wallet
   * @param choice voter's choice
   * @returns vote id if successfully cast a vote
   */
  vote(signer: ethers.Wallet, choice: Choice): Promise<VoteId>;

  /**
   * Execute a proposal in zDAO
   * @param signer signer wallet
   * @returns transaction response
   * @exception throw Error if signer is not Gnosis Safe owner
   * @exception throw Error if proposal does not conain meta data to transfer tokens
   */
  execute(signer: ethers.Wallet): Promise<ethers.providers.TransactionResponse>;
}
