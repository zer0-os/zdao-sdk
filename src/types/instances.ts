import { ethers } from 'ethers';

import {
  CalculateProposalParams,
  CreateProposalParams,
  CreateZDAOParams,
  FinalizeProposalParams,
  PaginationParam,
  VoteProposalParams,
} from './params';
import { ProposalId, zDAOId, zNA } from './primitives';
import {
  ProposalProperties,
  Transaction,
  Vote,
  zDAOAssets,
  zDAOCoins,
  zDAOCollectibles,
  zDAOProperties,
} from './structures';

type CreateZDAOParamsType<T extends CreateZDAOParams> =
  T extends CreateZDAOParams ? T : CreateZDAOParams;

type CreateProposalParamsType<T extends CreateProposalParams> =
  T extends CreateProposalParams ? T : CreateProposalParams;

type VoteProposalParamsType<T extends VoteProposalParams> =
  T extends VoteProposalParams ? T : VoteProposalParams;

type CalculateProposalParamsType<T extends CalculateProposalParams> =
  T extends CalculateProposalParams ? T : CalculateProposalParams;

type FinalizeProposalParamsType<T extends FinalizeProposalParams> =
  T extends FinalizeProposalParams ? T : FinalizeProposalParams;

export interface SDKInstance<
  VoteT extends Vote,
  ProposalT extends Proposal<VoteT>,
  zDAOT extends zDAO<VoteT, ProposalT>
> {
  /**
   * Create zDAO
   * @param provider Web3 provider or wallet
   * @param account signer address
   * @param params
   */
  createZDAO(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreateZDAOParamsType<CreateZDAOParams>
  ): Promise<void>;

  /**
   * Delete zDAO
   * @param provider Web3 provider or wallet
   * @param account signer address
   * @param zDAOId
   */
  deleteZDAO(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    zDAOId: zDAOId
  ): Promise<void>;

  /**
   * Get all the list of zNA
   * @returns list of zNA
   */
  listZNAs(): Promise<zNA[]>;

  /**
   * Get all the list of zDAO instance
   * @returns list of zDAO
   */
  listZDAOs(): Promise<zDAOT[]>;

  /**
   * Create an zDAO instance by zNA
   * @param zNA zNA address
   * @returns created zDAO instance
   * @exception throw Error if zNA does not exist
   */
  getZDAOByZNA(zNA: zNA): Promise<zDAOT>;

  /**
   * Check if zDAO exists which associated with given zNA
   * @param zNA zNA address
   * @returns true if zNA exists
   */
  doesZDAOExist(zNA: zNA): Promise<boolean>;

  /**
   * Create zDAO from parameters for test
   * @param provider Web3 provider or wallet
   * @param account signer address
   * @param params packaged parameters of zDAO
   * @exception throw Error if zNA already exists
   * @exception throw Error if owners is empty
   * @exception throw Error if title is empty
   */
  createZDAOFromParams(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreateZDAOParamsType<CreateZDAOParams>
  ): Promise<zDAOT>;

  /**
   * List all associated zNAs, only used for test
   */
  listZNAsFromParams(): Promise<zNA[]>;

  /**
   * Get zDAO by zNA, only used for test
   * @param zNA
   */
  getZDAOByZNAFromParams(zNA: zNA): Promise<zDAOT>;

  /**
   * Check if zDAO exists which associated with given zNA, only used for test
   * @param zNA
   */
  doesZDAOExistFromParams(zNA: zNA): Promise<boolean>;
}

export interface zDAO<VoteT extends Vote, ProposalT extends Proposal<VoteT>>
  extends zDAOProperties {
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
  listProposals(pagination?: PaginationParam): Promise<ProposalT[]>;

  /**
   * Get the specific proposal
   * @param id proposal id
   * @returns proposal instance
   * @exception throw Error if not exist proposal id
   */
  getProposal(id: ProposalId): Promise<ProposalT>;

  /**
   * Create a proposal in zDAO
   * @param provider Web3 provider or wallet
   * @param account signer address
   * @param payload packaged parameters to create a proposal
   * @returns proposal id if success
   */
  createProposal(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: CreateProposalParamsType<CreateProposalParams>
  ): Promise<ProposalId>;
}

export interface Proposal<VoteT extends Vote> extends ProposalProperties {
  /**
   * Check if proposal is succeeded
   * @returns true if proposal is succeeded
   */
  canExecute(): boolean;

  /**
   * Get all the votes by proposal id filtering with the function parameter
   * @returns list of votes
   */
  listVotes(pagination?: PaginationParam): Promise<VoteT[]>;

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
  updateScoresAndVotes(): Promise<Proposal<VoteT>>;

  /**
   * Cast a vote on proposal
   * @param provider Web3 provider or wallet
   * @param account signer address
   * @param payload vote parameters
   * @returns vote id if successfully cast a vote
   */
  vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: VoteProposalParamsType<VoteProposalParams>
  ): Promise<void>;

  /**
   * Calculate voting result and sync to ethereum
   * @param provider Web3 provider or wallet
   * @param account signer address
   * @param payload parameters for proposal calculation
   */
  calculate(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: CalculateProposalParamsType<CalculateProposalParams>
  ): Promise<void>;

  /**
   * Finalize proposal
   * @param provider Web3 provider or wallet
   * @param account signer address
   * @param payload parameters for proposal finalization
   */
  finalize(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: FinalizeProposalParamsType<FinalizeProposalParams>
  ): Promise<void>;
}
