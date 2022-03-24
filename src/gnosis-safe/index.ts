import { TransactionResponse } from '@ethersproject/abstract-provider';
import Safe from '@gnosis.pm/safe-core-sdk';
import { SafeEthersSigner, SafeService } from '@gnosis.pm/safe-ethers-adapters';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import {
  getBalances,
  getTransactionHistory,
  SafeBalanceResponse,
  Transaction as Transaction,
  TransactionListItem as TransactionListItem,
} from '@gnosis.pm/safe-react-gateway-sdk';
import { BigNumberish, ethers } from 'ethers';

import TransferAbi from '../config/constants/abi/transfer.json';
import { GnosisSafeConfig } from '../types';

class GnosisSafeClient {
  private readonly _config: GnosisSafeConfig;

  constructor(config: GnosisSafeConfig) {
    this._config = config;
  }

  async isOwnerAddress(
    signer: ethers.Wallet,
    safeAddress: string,
    address: string
  ): Promise<boolean> {
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safe = await Safe.create({
      ethAdapter,
      safeAddress,
    });
    const owners = await safe.getOwners();
    if (!owners.find((owner) => owner === address)) {
      return false;
    }
    return true;
  }

  async transferEther(
    safeAddress: string,
    signer: ethers.Wallet,
    recipient: string,
    amount: BigNumberish
  ): Promise<TransactionResponse> {
    const service = new SafeService(this._config.serviceUri);
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safe = await Safe.create({
      ethAdapter,
      safeAddress,
    });

    const safeSigner = new SafeEthersSigner(safe, service, signer.provider);
    return safeSigner.sendTransaction({ to: recipient, value: amount });
  }

  async transferERC20(
    safeAddress: string,
    signer: ethers.Wallet,
    token: string,
    recipient: string,
    amount: BigNumberish
  ): Promise<TransactionResponse> {
    const service = new SafeService(this._config.serviceUri);
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safe = await Safe.create({
      ethAdapter,
      safeAddress,
    });

    const safeSigner = new SafeEthersSigner(safe, service, signer.provider);
    const transferContract = new ethers.Contract(
      token,
      TransferAbi,
      safeSigner
    );
    return await transferContract
      .connect(safeSigner)
      .transfer(recipient, amount);
  }

  async listAssets(
    safeAddress: string,
    network: string,
    selectedCurrency = 'USD'
  ): Promise<SafeBalanceResponse> {
    const address = ethers.utils.getAddress(safeAddress);

    return await getBalances(
      this._config.gateway,
      network,
      address,
      selectedCurrency,
      {
        exclude_spam: true,
        trusted: false,
      }
    );
  }

  async listTransactions(
    safeAddress: string,
    network: string
  ): Promise<Transaction[]> {
    const address = ethers.utils.getAddress(safeAddress);

    const { results } = await getTransactionHistory(
      this._config.gateway,
      network,
      address
    );

    const filtered = results
      .filter(
        (tx: TransactionListItem) =>
          tx.type === 'TRANSACTION' &&
          tx.transaction.txInfo.type === 'Transfer' &&
          (tx.transaction.txInfo.direction === 'INCOMING' ||
            tx.transaction.txInfo.direction === 'OUTGOING')
      )
      .map((tx) => tx as Transaction);

    return filtered;
  }
}

export default GnosisSafeClient;
