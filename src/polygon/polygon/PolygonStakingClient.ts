import { ContractReceipt, ethers } from 'ethers';

import { FailedTxError, NetworkError } from '../../types';
import { calculateGasMargin } from '../../utilities';
import GlobalClient from '../client/GlobalClient';
import { Staking__factory } from '../config/types/factories/Staking__factory';
import { Staking } from '../config/types/Staking';

class PolygonStakingClient {
  protected readonly contract: Staking;

  constructor(address: string) {
    this.contract = Staking__factory.connect(
      address,
      GlobalClient.polyRpcProvider
    );
  }

  async stakeERC20(
    signer: ethers.Signer,
    token: string,
    amount: string
  ): Promise<ContractReceipt> {
    try {
      const gasEstimated = await this.contract
        .connect(signer)
        .estimateGas.stakeERC20(token, amount);

      const tx = await this.contract.connect(signer).stakeERC20(token, amount, {
        gasLimit: calculateGasMargin(gasEstimated),
      });
      return await tx.wait();
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
      const gasEstimated = await this.contract
        .connect(signer)
        .estimateGas.stakeERC721(token, tokenId);

      const tx = await this.contract
        .connect(signer)
        .stakeERC721(token, tokenId, {
          gasLimit: calculateGasMargin(gasEstimated),
        });
      return await tx.wait();
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
      const gasEstimated = await this.contract
        .connect(signer)
        .estimateGas.unstakeERC20(token, amount);

      const tx = await this.contract
        .connect(signer)
        .unstakeERC20(token, amount, {
          gasLimit: calculateGasMargin(gasEstimated),
        });
      return await tx.wait();
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
      const gasEstimated = await this.contract
        .connect(signer)
        .estimateGas.unstakeERC721(token, tokenId);

      const tx = await this.contract
        .connect(signer)
        .unstakeERC721(token, tokenId, {
          gasLimit: calculateGasMargin(gasEstimated),
        });
      return await tx.wait();
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async stakingPower(account: string, token: string): Promise<string> {
    try {
      return this.contract
        .stakingPower(account, token)
        .then((value) => value.toString());
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }

  async pastStakingPower(
    account: string,
    token: string,
    blockNumber: number
  ): Promise<string> {
    try {
      return this.contract
        .pastStakingPower(account, token, blockNumber)
        .then((value) => value.toString());
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }

  async stakedERC20Amount(account: string, token: string): Promise<string> {
    try {
      return this.contract
        .stakedERC20Amount(account, token)
        .then((value) => value.toString());
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }

  async isStakedERC721(
    account: string,
    token: string,
    tokenId: string
  ): Promise<boolean> {
    try {
      return await this.contract.isStakedERC721(account, token, tokenId);
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }
}

export default PolygonStakingClient;
