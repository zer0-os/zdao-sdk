import { ContractReceipt, ethers } from 'ethers';

import GlobalClient from '../client/GlobalClient';
import StakingAbi from '../config/abi/Staking.json';
import { Staking } from '../config/types/Staking';

class PolygonStakingClient {
  protected readonly _contract: Staking;

  constructor(address: string) {
    this._contract = new ethers.Contract(
      address,
      StakingAbi.abi,
      GlobalClient.polyRpcProvider
    ) as Staking;
  }

  async stakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    const tx = await this._contract.connect(signer).stakeERC20(token, amount);
    return await tx.wait();
  }

  async stakeERC721(
    signer: ethers.Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt> {
    const tx = await this._contract.connect(signer).stakeERC721(token, tokenId);
    return await tx.wait();
  }

  async unstakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    const tx = await this._contract.connect(signer).unstakeERC20(token, amount);
    return await tx.wait();
  }

  async unstakeERC721(
    signer: ethers.Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt> {
    const tx = await this._contract
      .connect(signer)
      .unstakeERC721(token, tokenId);
    return await tx.wait();
  }

  async stakingPower(account: string, token: string): Promise<string> {
    return this._contract
      .stakingPower(account, token)
      .then((value) => value.toString());
  }

  async pastStakingPower(
    account: string,
    token: string,
    blockNumber: number
  ): Promise<string> {
    return this._contract
      .pastStakingPower(account, token, blockNumber)
      .then((value) => value.toString());
  }

  async stakedERC20Amount(account: string, token: string): Promise<string> {
    return this._contract
      .stakedERC20Amount(account, token)
      .then((value) => value.toString());
  }

  isStakedERC721(
    account: string,
    token: string,
    tokenId: string
  ): Promise<boolean> {
    return this.isStakedERC721(account, token, tokenId);
  }
}

export default PolygonStakingClient;
