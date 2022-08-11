import { ethers } from 'ethers';

import {
  CreateProposalParams,
  CreateZDAOParams,
  PaginationParam,
} from './params';
import { Choice, ProposalId, VoteId, zNA } from './primitives';
import {
  ProposalProperties,
  TokenMintOptions,
  Transaction,
  Vote,
  zDAOAssets,
  zDAOCoins,
  zDAOCollectibles,
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
   * @param packaged parameters of zDAO
   * @exception throw Error if zNA already exists
   * @exception throw Error if owners is empty
   * @exception throw Error if title is empty
   */
  createZDAOFromParams(param: CreateZDAOParams): Promise<zDAO>;

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
   * Get the list of coins and total amount in USD
   * @return list of coins
   */
  listAssetsCoins(): Promise<zDAOCoins>;

  /**
   * Get the list of collectibles
   * @return list of collectibles
   */
  listAssetsCollectibles(): Promise<zDAOCollectibles>;

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
   * @returns voting power as number
   */
  getVotingPowerOfUser(account: string): Promise<number>;

  /**
   * Update latest scores and votes
   * @returns proposal instance itself
   */
  updateScoresAndVotes(): Promise<Proposal>;

  /**
   * Cast a vote on proposal
   * @param provider Web3 provider
   * @param account signer address
   * @param choice voter's choice, 1: vote on first choice, 2: on second choice
   * @returns vote id if successfully cast a vote
   */
  vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    choice: Choice
  ): Promise<VoteId>;

  /**
   * Execute a proposal in zDAO
   * @param signer signer wallet
   * @returns transaction response
   * @exception throw Error if signer is not Gnosis Safe owner
   * @exception throw Error if proposal does not conain meta data to transfer tokens
   */
  execute(signer: ethers.Signer): Promise<void>;
}
