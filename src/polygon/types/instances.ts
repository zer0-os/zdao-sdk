import { ContractReceipt, ethers } from 'ethers';

import {
  Proposal as BaseProposal,
  SDKInstance as SDKBaseInstance,
  Vote as BaseVote,
  zDAO as BaseZDAO,
} from '../../types';
import { StakingProperties, zDAOOptions } from './structures';

export interface SDKInstance extends SDKBaseInstance<Vote, Proposal, zDAO> {
  /**
   * Staking instance associated with Staking contract
   */
  staking: Staking;

  /**
   * Registry instance associated with the contract which has mapping of tokens
   * between Ethereum and Polygon
   */
  registry: Registry;
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

export interface zDAO extends BaseZDAO<Vote, Proposal>, zDAOOptions {
  /**
   * Check if transaction has been verified by Matic validators
   * @param txHash transaction hash which happened on Polygon to send data to Ethereum
   */
  isCheckPointed(txHash: string): Promise<boolean>;
}

export interface Proposal extends BaseProposal<Vote> {
  /**
   * Find all the checkpointing transaction hashes
   */
  getCheckPointingHashes(): Promise<string[]>;
}

export type Vote = BaseVote;
