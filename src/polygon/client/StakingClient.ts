import { ContractReceipt, ethers } from 'ethers';

import { FailedTxError } from '../../types';
import PolygonStakingClient from '../polygon/PolygonStakingClient';
import { Staking, StakingProperties } from '../types';

class StakingClient implements Staking {
  protected readonly _properties: StakingProperties;
  protected _polyStaking: PolygonStakingClient;

  constructor(properties: StakingProperties) {
    this._properties = properties;
    this._polyStaking = new PolygonStakingClient(properties.address);
  }

  get network() {
    return this._properties.network;
  }

  get address() {
    return this._properties.address;
  }

  stakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    try {
      return this._polyStaking.stakeERC20(signer, token, amount);
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
      return this._polyStaking.stakeERC721(signer, token, tokenId);
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
      return this._polyStaking.unstakeERC20(signer, token, amount);
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
      return this._polyStaking.unstakeERC721(signer, token, tokenId);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  stakingPower(account: string, token: string): Promise<string> {
    return this._polyStaking.stakingPower(account, token);
  }

  pastStakingPower(
    account: string,
    token: string,
    blockNumber: number
  ): Promise<string> {
    return this._polyStaking.pastStakingPower(account, token, blockNumber);
  }
}

export default StakingClient;
