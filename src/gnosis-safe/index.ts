import Safe from '@gnosis.pm/safe-core-sdk';
import { SafeEthersSigner, SafeService } from '@gnosis.pm/safe-ethers-adapters';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import {
  SafeBalanceResponse,
  SafeCollectibleResponse,
  Transaction as Transaction,
  TransactionListItem as TransactionListItem,
} from '@gnosis.pm/safe-react-gateway-sdk';
import fetch from 'cross-fetch';
import { BigNumberish, ethers } from 'ethers';

import ERC20Abi from '../config/constants/abi/ERC20.json';
import { GnosisSafeConfig } from '../types';

class GnosisSafeClient {
  private readonly _config: GnosisSafeConfig;
  private readonly EMPTY_DATA = '0x';

  constructor(config: GnosisSafeConfig) {
    this._config = config;
  }

  async isOwnerAddress(
    signer: ethers.Signer,
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
    signer: ethers.Signer,
    recipient: string,
    amount: BigNumberish
  ): Promise<void> {
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safeService = new SafeService(this._config.serviceUri);
    const safe = await Safe.create({
      ethAdapter,
      safeAddress,
    });
    const safeSigner = new SafeEthersSigner(safe, safeService, signer.provider);

    await safeSigner.sendTransaction({
      to: recipient,
      data: this.EMPTY_DATA,
      value: amount.toString(),
    });
  }

  async transferERC20(
    safeAddress: string,
    signer: ethers.Signer,
    token: string,
    recipient: string,
    amount: BigNumberish
  ): Promise<void> {
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safeService = new SafeService(this._config.serviceUri);
    const safe = await Safe.create({
      ethAdapter,
      safeAddress,
    });
    const safeSigner = new SafeEthersSigner(safe, safeService, signer.provider);

    const erc20Interface = new ethers.utils.Interface(ERC20Abi);
    const txData = erc20Interface.encodeFunctionData('transfer', [
      recipient,
      amount,
    ]);
    await safeSigner.sendTransaction({
      value: '0',
      to: token,
      data: txData,
    });
  }

  async listAssets(
    safeAddress: string,
    network: string,
    selectedCurrency = 'USD'
  ): Promise<SafeBalanceResponse> {
    const address = ethers.utils.getAddress(safeAddress);

    const url = `https://zero-gateway.azure-api.net/gnosis/${network}/safes/${address}/balances/${selectedCurrency}?exclude_spam=true&trusted=false`;

    const res = await fetch(url);
    const data = await res.json();
    return data;
  }

  async listCollectibles(
    safeAddress: string,
    network: string
  ): Promise<SafeCollectibleResponse[]> {
    const address = ethers.utils.getAddress(safeAddress);

    const url = `https://zero-gateway.azure-api.net/gnosis/${network}/safes/${address}/collectibles?exclude_spam=true&trusted=false`;

    const res = await fetch(url);
    const data = await res.json();
    return data;
  }

  async listTransactions(
    safeAddress: string,
    network: string
  ): Promise<Transaction[]> {
    const address = ethers.utils.getAddress(safeAddress);

    const url = `https://zero-gateway.azure-api.net/gnosis/${network}/safes/${address}/transactions/history`;

    const resp = await fetch(url).then((res) => res.json());
    const { results } = resp;

    const filtered = results
      .filter(
        (tx: TransactionListItem) =>
          tx.type === 'TRANSACTION' &&
          tx.transaction.txInfo.type === 'Transfer' &&
          (tx.transaction.txInfo.direction === 'INCOMING' ||
            tx.transaction.txInfo.direction === 'OUTGOING')
      )
      .map((tx: TransactionListItem) => tx as Transaction);

    return filtered;
  }
}

export default GnosisSafeClient;
