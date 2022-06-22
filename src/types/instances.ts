import { ethers } from 'ethers';

import {
  CalculateProposalParams,
  CreateProposalParams,
  CreateZDAOParams,
  ExecuteProposalParams,
  FinalizeProposalParams,
  PaginationParam,
  TokenMintOptions,
  VoteProposalParams,
} from './params';
import { ProposalId, zDAOId, zNA } from './primitives';
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
  createZDAO(signer: ethers.Signer, params: CreateZDAOParams): Promise<void>;

  /**
   * Delete zDAO
   * @param signer
   * @param zDAOId
   */
  deleteZDAO(signer: ethers.Signer, zDAOId: zDAOId): Promise<void>;

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
   * Create new zToken with given name and symbol and return deployed address
   * @param name name of zToken
   * @param symbol symbol of zToken
   * @param options mint options
   */
  createZToken(
    signer: ethers.Signer,
    name: string,
    symbol: string,
    options?: TokenMintOptions
  ): Promise<string>;

  /**
   * Create zDAO from parameters for test
   * @params packaged parameters of zDAO
   * @exception throw Error if zNA already exists
   * @exception throw Error if owners is empty
   * @exception throw Error if title is empty
   */
  createZDAOFromParams(
    signer: ethers.Signer,
    params: CreateZDAOParams
  ): Promise<zDAO>;

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
  listProposals(pagination?: PaginationParam): Promise<Proposal[]>;

  /**
   * Get the specific proposal
   * @param id proposal id
   * @returns proposal instance
   * @exception throw Error if not exist proposal id
   */
  getProposal(id: ProposalId): Promise<Proposal>;

  /**
   * Create a proposal in zDAO
   * @param provider Web3 provider or wallet
   * @param account signer address
   * @param payload packaged parameters to create a proposal
   * @returns proposal id if success
   */
  createProposal(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    payload: CreateProposalParams
  ): Promise<ProposalId>;
}

export interface Proposal extends ProposalProperties {
  /**
   * Get all the votes by proposal id filtering with the function parameter
   * @returns list of votes
   */
  listVotes(pagination?: PaginationParam): Promise<Vote[]>;

  /**
   * Get voting power of the user in zDAO
   * @param account account address
   * @returns voting power as BigNumber
   */
  getVotingPowerOfUser(account: string): Promise<string>;

  /**
   * Update latest scores and votes
   * @returns proposal instance itself
   */
  updateScoresAndVotes(): Promise<Proposal>;

  /**
   * Cast a vote on proposal
   * @param provider Web3 provider or wallet
   * @param account signer address
   * @param payload vote parameters
   * @returns vote id if successfully cast a vote
   */
  vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    payload: VoteProposalParams
  ): Promise<void>;

  /**
   * Calculate voting result and sync to ethereum
   * @param signer signer wallet
   * @param payload parameters for proposal calculation
   */
  calculate(
    signer: ethers.Signer,
    payload: CalculateProposalParams
  ): Promise<void>;

  /**
   * Finalize proposal
   * @param signer signer wallet
   * @param payload parameters for proposal finalization
   */
  finalize(
    signer: ethers.Signer,
    payload: FinalizeProposalParams
  ): Promise<void>;

  /**
   * Execute a proposal in zDAO
   * @param signer signer wallet
   * @param payload parameters for proposal execution
   * @returns transaction response
   * @exception throw Error if signer is not Gnosis Safe owner
   * @exception throw Error if proposal does not conain meta data to transfer tokens
   */
  execute(signer: ethers.Signer, payload: ExecuteProposalParams): Promise<void>;
}
