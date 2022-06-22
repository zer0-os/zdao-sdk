import { ContractReceipt, ethers } from 'ethers';

import { SDKInstance as SDKBaseInstance } from '../../types';
import { StakingProperties } from './structures';

export interface SDKInstance extends SDKBaseInstance {
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
