import { ContractReceipt, ethers, Signer } from 'ethers';

import StakingAbi from '../config/abi/Staking.json';
import { Staking } from '../config/types/Staking';
import { DAOConfig } from '../types';

class PolyStakingClient {
  private readonly _config: DAOConfig;
  protected readonly _contract: Staking;

  constructor(config: DAOConfig, address: string) {
    this._config = config;
    this._contract = new ethers.Contract(
      address,
      StakingAbi.abi,
      new ethers.providers.JsonRpcProvider(
        this._config.rpcUrl,
        this._config.network
      )
    ) as Staking;
  }

  async stakeERC20(
    signer: Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    const tx = await this._contract.connect(signer).stakeERC20(token, amount);
    return await tx.wait();
  }

  async stakeERC721(
    signer: Signer,
    token: string,
    tokenId: string
  ): Promise<ContractReceipt> {
    const tx = await this._contract.connect(signer).stakeERC721(token, tokenId);
    return await tx.wait();
  }

  async unstakeERC20(
    signer: Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    const tx = await this._contract.connect(signer).unstakeERC20(token, amount);
    return await tx.wait();
  }

  async unstakeERC721(
    signer: Signer,
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
}

export default PolyStakingClient;