import { ContractReceipt, ethers } from 'ethers';

import { StakingProperties } from './structures';

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
}

export interface Registry {
  ethereumToPolygonToken(ethereumToken: string): Promise<string>;

  polygonToEthereumToken(polygonToken: string): Promise<string>;
}
