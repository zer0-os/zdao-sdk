import { ContractReceipt, ethers } from 'ethers';

import { FailedTxError } from '../../types';
import PolygonStakingClient from '../polygon/PolygonStakingClient';
import { Staking, StakingProperties } from '../types';
import GlobalClient from './GlobalClient';

class StakingClient implements Staking {
  protected properties?: StakingProperties;
  protected polyStaking?: PolygonStakingClient;

  private async getPolygonStakingClient(): Promise<PolygonStakingClient> {
    if (!this.polyStaking) {
      const properties =
        await GlobalClient.polygonZDAOChef.getStakingProperties();
      this.polyStaking = new PolygonStakingClient(properties.address);
    }
    return this.polyStaking;
  }

  get network() {
    return this.properties?.network ?? 0;
  }

  get address() {
    return this.properties?.address ?? ethers.constants.AddressZero;
  }

  async stakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    try {
      const instance = await this.getPolygonStakingClient();
      return instance.stakeERC20(signer, token, amount);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async stakeERC721(
    signer: ethers.Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt> {
    try {
      const instance = await this.getPolygonStakingClient();
      return instance.stakeERC721(signer, token, tokenId);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async unstakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    try {
      const instance = await this.getPolygonStakingClient();
      return instance.unstakeERC20(signer, token, amount);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async unstakeERC721(
    signer: ethers.Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt> {
    try {
      const instance = await this.getPolygonStakingClient();
      return instance.unstakeERC721(signer, token, tokenId);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async stakingPower(account: string, token: string): Promise<string> {
    return this.getPolygonStakingClient().then((instance) =>
      instance.stakingPower(account, token)
    );
  }

  async pastStakingPower(
    account: string,
    token: string,
    blockNumber: number
  ): Promise<string> {
    return this.getPolygonStakingClient().then((instance) =>
      instance.pastStakingPower(account, token, blockNumber)
    );
  }

  async stakedERC20Amount(account: string, token: string): Promise<string> {
    return this.getPolygonStakingClient().then((instance) =>
      instance.stakedERC20Amount(account, token)
    );
  }

  async isStakedERC721(
    account: string,
    token: string,
    tokenId: string
  ): Promise<boolean> {
    return this.getPolygonStakingClient().then((instance) =>
      instance.isStakedERC721(account, token, tokenId)
    );
  }
}

export default StakingClient;
