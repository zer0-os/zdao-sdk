import { ContractReceipt, ethers } from 'ethers';

import PolygonStakingClient from '../polygon/PolygonStakingClient';
import { Staking, StakingProperties } from '../types';

class StakingClient implements Staking {
  protected properties: StakingProperties;
  protected polyStaking: PolygonStakingClient;

  constructor(properties: StakingProperties) {
    this.properties = properties;
    this.polyStaking = new PolygonStakingClient(properties.address);
  }

  get address() {
    return this.properties?.address ?? ethers.constants.AddressZero;
  }

  async stakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    return this.polyStaking.stakeERC20(signer, token, amount);
  }

  async stakeERC721(
    signer: ethers.Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt> {
    return this.polyStaking.stakeERC721(signer, token, tokenId);
  }

  async unstakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    return this.polyStaking.unstakeERC20(signer, token, amount);
  }

  async unstakeERC721(
    signer: ethers.Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt> {
    return this.polyStaking.unstakeERC721(signer, token, tokenId);
  }

  async stakingPower(account: string, token: string): Promise<string> {
    return this.polyStaking.stakingPower(account, token);
  }

  async pastStakingPower(
    account: string,
    token: string,
    blockNumber: number
  ): Promise<string> {
    return this.polyStaking.pastStakingPower(account, token, blockNumber);
  }

  async stakedERC20Amount(account: string, token: string): Promise<string> {
    return this.polyStaking.stakedERC20Amount(account, token);
  }

  async isStakedERC721(
    account: string,
    token: string,
    tokenId: string
  ): Promise<boolean> {
    return this.polyStaking.isStakedERC721(account, token, tokenId);
  }
}

export default StakingClient;
