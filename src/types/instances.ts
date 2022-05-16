import { ContractReceipt, Signer } from 'ethers';

import { CreateProposalParams, CreateZDAOParams } from './params';
import { Choice, ProposalId, zDAOId, zNA } from './primitives';
import {
  ProposalProperties,
  Transaction,
  Vote,
  zDAOAssets,
  zDAOProperties,
} from './structures';

export interface SDKInstance {
  /**
   * Create zDAO
   * @param signer
   * @param params
   */
  createZDAO(signer: Signer, params: CreateZDAOParams): Promise<void>;

  /**
   * Delete zDAO
   * @param signer
   * @param zDAOId
   */
  deleteZDAO(signer: Signer, zDAOId: zDAOId): Promise<void>;

  /**
   * Get all the list of zNA
   * @returns list of zNA
   */
  listZNAs(): Promise<zNA[]>;

  /**
   * Get all the list of zDAO instance
   * @returns list of zDAO
   */
  listZDAOs(): Promise<zDAO[]>;

  /**
   * Create an zDAO instance by zNA
   * @param zNA zNA address
   * @returns created zDAO instance
   * @exception throw Error if zNA does not exist
   */
  getZDAOByZNA(zNA: zNA): Promise<zDAO>;

  /**
   * Check if zDAO exists which associated with given zNA
   * @param zNA zNA address
   * @returns true if zNA exists
   */
  doesZDAOExist(zNA: zNA): Promise<boolean>;

  /**
   * Create zDAO from parameters for test
   * @params packaged parameters of zDAO
   * @exception throw Error if zNA already exists
   * @exception throw Error if owners is empty
   * @exception throw Error if title is empty
   */
  createZDAOFromParams(signer: Signer, params: CreateZDAOParams): Promise<zDAO>;

  /**
   * List all associated zNAs, only used for test
   */
  listZNAsFromParams(): Promise<zNA[]>;

  /**
   * Get zDAO by zNA, only used for test
   * @param zNA
   */
  getZDAOByZNAFromParams(zNA: zNA): Promise<zDAO>;

  /**
   * Check if zDAO exists which associated with given zNA, only used for test
   * @param zNA
   */
  doesZDAOExistFromParams(zNA: zNA): Promise<boolean>;
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
    signer: Signer,
    payload: CreateProposalParams
  ): Promise<ProposalId>;

  /**
   * Check if transaction has been verified by Matic validators
   * @param txHash transaction hash which happened on Polygon to send data to Ethereum
   */
  isCheckPointed(txHash: string): Promise<boolean>;

  /**
   * If tx is successfully check pointed, create a transaction to receive message
   * @param signer
   * @param txHash
   */
  syncState(signer: Signer, txHash: string): Promise<ContractReceipt>;
}

export interface Proposal extends ProposalProperties {
  /**
   * Get all the votes by proposal id filtering with the function parameter
   * @returns list of votes
   */
  listVotes(): Promise<Vote[]>;

  /**
   * Get voting power of the user in zDAO
   * @param account account address
   * @returns voting power as BigNumber
   */
  getVotingPowerOfUser(account: string): Promise<string>;

  /**
   * Cast a vote on proposal
   * @param signer signer wallet
   * @param choice voter's choice
   * @returns vote id if successfully cast a vote
   */
  vote(signer: Signer, choice: Choice): Promise<ContractReceipt>;

  /**
   * Collect voting result and sync to ethereum
   * @param signer signer wallet
   */
  collect(signer: Signer): Promise<ContractReceipt>;

  /**
   * Execute a proposal in zDAO
   * @param signer signer wallet
   * @returns transaction response
   * @exception throw Error if signer is not Gnosis Safe owner
   * @exception throw Error if proposal does not conain meta data to transfer tokens
   */
  execute(signer: Signer): Promise<ContractReceipt>;

  /**
   * Find all the transaction hashes which collected proposal
   */
  collectTxHash(): Promise<string[]>;
}
