import { ContractReceipt, ethers } from 'ethers';

import { Proposal, ProposalId, SDKInstance, Vote, zDAO } from '../../types';
import {
  CalculatePolygonProposalParams,
  CreatePolygonProposalParams,
  CreatePolygonZDAOParams,
  FinalizePolygonProposalParams,
  VotePolygonProposalParams,
} from './params';
import { StakingProperties, zDAOOptions } from './structures';

export interface PolygonSDKInstance
  extends SDKInstance<PolygonVote, PolygonProposal, PolygonZDAO> {
  /**
   * Staking instance associated with Staking contract
   */
  staking: Staking;

  /**
   * Registry instance associated with the contract which has mapping of tokens
   * between Ethereum and Polygon
   */
  registry: Registry;

  /**
   * Override the createZDAO function from SDKInstance
   * @param provider
   * @param account
   * @param params
   */
  createZDAO(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreatePolygonZDAOParams
  ): Promise<void>;

  createZDAOFromParams(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreatePolygonZDAOParams
  ): Promise<PolygonZDAO>;
}

export interface Staking extends StakingProperties {
  stakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt>;

  stakeERC721(
    signer: ethers.Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt>;

  unstakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt>;

  unstakeERC721(
    signer: ethers.Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt>;

  stakingPower(account: string, token: string): Promise<string>;

  pastStakingPower(
    account: string,
    token: string,
    blockNumber: number
  ): Promise<string>;

  stakedERC20Amount(account: string, token: string): Promise<string>;

  isStakedERC721(
    account: string,
    token: string,
    tokenId: string
  ): Promise<boolean>;
}

export interface Registry {
  ethereumToPolygonToken(ethereumToken: string): Promise<string>;

  polygonToEthereumToken(polygonToken: string): Promise<string>;
}

export interface PolygonZDAO
  extends zDAO<PolygonVote, PolygonProposal>,
    zDAOOptions {
  /**
   * Check if transaction has been verified by Matic validators
   * @param txHash transaction hash which happened on Polygon to send data to Ethereum
   */
  isCheckPointed(txHash: string): Promise<boolean>;

  /**
   * Override the createProposal function from zDAO
   * @param provider
   * @param account
   * @param payload
   */
  createProposal(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: CreatePolygonProposalParams
  ): Promise<ProposalId>;
}

export interface PolygonProposal extends Proposal<PolygonVote> {
  /**
   * Find all the checkpointing transaction hashes
   */
  getCheckPointingHashes(): Promise<string[]>;

  /**
   * Override vote function in Proposal
   * @param provider
   * @param account
   * @param payload
   */
  vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: VotePolygonProposalParams
  ): Promise<void>;

  /**
   * Override calculate function in Proposal
   * @param provider
   * @param account
   * @param payload
   */
  calculate(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: CalculatePolygonProposalParams
  ): Promise<void>;

  /**
   * Override finalize function in Proposal
   * @param provider
   * @param account
   * @param payload
   */
  finalize(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: FinalizePolygonProposalParams
  ): Promise<void>;
}

export type PolygonVote = Vote;
