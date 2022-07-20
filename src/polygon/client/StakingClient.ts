import { ContractReceipt, ethers } from 'ethers';

import { FailedTxError } from '../../types';
import PolygonStakingClient from '../polygon/PolygonStakingClient';
import { Staking, StakingProperties } from '../types';

class StakingClient implements Staking {
  protected readonly properties: StakingProperties;
  protected readonly polyStaking: PolygonStakingClient;

  constructor(properties: StakingProperties) {
    this.properties = properties;
    this.polyStaking = new PolygonStakingClient(properties.address);
  }

  get network() {
    return this.properties.network;
  }

  get address() {
    return this.properties.address;
  }

  stakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    try {
      return this.polyStaking.stakeERC20(signer, token, amount);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  stakeERC721(
    signer: ethers.Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt> {
    try {
      return this.polyStaking.stakeERC721(signer, token, tokenId);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  unstakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    try {
      return this.polyStaking.unstakeERC20(signer, token, amount);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  unstakeERC721(
    signer: ethers.Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt> {
    try {
      return this.polyStaking.unstakeERC721(signer, token, tokenId);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  stakingPower(account: string, token: string): Promise<string> {
    return this.polyStaking.stakingPower(account, token);
  }

  pastStakingPower(
    account: string,
    token: string,
    blockNumber: number
  ): Promise<string> {
    return this.polyStaking.pastStakingPower(account, token, blockNumber);
  }

  stakedERC20Amount(account: string, token: string): Promise<string> {
    return this.polyStaking.stakedERC20Amount(account, token);
  }

  isStakedERC721(
    account: string,
    token: string,
    tokenId: string
  ): Promise<boolean> {
    return this.polyStaking.isStakedERC721(account, token, tokenId);
  }
}

export default StakingClient;
