import Safe from '@gnosis.pm/safe-core-sdk';
import { SafeEthersSigner, SafeService } from '@gnosis.pm/safe-ethers-adapters';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import {
  getTransactionHistory,
  SafeBalanceResponse,
  SafeCollectibleResponse,
  Transaction as Transaction,
  TransactionListItem as TransactionListItem,
} from '@gnosis.pm/safe-react-gateway-sdk';
import fetch from 'cross-fetch';
import { ethers } from 'ethers';

import ERC20Abi from '../config/abi/ERC20.json';
import { GnosisSafeConfig } from '../types';

class GnosisSafeClient {
  private readonly config: GnosisSafeConfig;
  private readonly ipfsGateway: string;
  private readonly EMPTY_DATA = '0x';

  constructor(config: GnosisSafeConfig, ipfsGateway: string) {
    this.config = config;
    this.ipfsGateway = ipfsGateway;
  }

  async isOwnerAddress(
    signer: ethers.Signer,
    gnosisSafe: string,
    address: string
  ): Promise<boolean> {
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safe = await Safe.create({
      ethAdapter,
      safeAddress: gnosisSafe,
    });
    const owners = await safe.getOwners();
    if (!owners.find((owner) => owner === address)) {
      return false;
    }
    return true;
  }

  async transferEther(
    gnosisSafe: string,
    signer: ethers.Signer,
    recipient: string,
    amount: ethers.BigNumberish
  ): Promise<void> {
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safeService = new SafeService(this.config.serviceUri);
    const safe = await Safe.create({
      ethAdapter,
      safeAddress: gnosisSafe,
    });
    const safeSigner = new SafeEthersSigner(safe, safeService, signer.provider);

    await safeSigner.sendTransaction({
      to: recipient,
      data: this.EMPTY_DATA,
      value: amount.toString(),
    });
  }

  async transferERC20(
    gnosisSafe: string,
    signer: ethers.Signer,
    token: string,
    recipient: string,
    amount: ethers.BigNumberish
  ): Promise<void> {
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safeService = new SafeService(this.config.serviceUri);
    const safe = await Safe.create({
      ethAdapter,
      safeAddress: gnosisSafe,
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
    gnosisSafe: string,
    network: string,
    selectedCurrency = 'USD'
  ): Promise<SafeBalanceResponse> {
    const address = ethers.utils.getAddress(gnosisSafe);

    const url = `https://zero-gateway.azure-api.net/gnosis/${network}/safes/${address}/balances/${selectedCurrency}?exclude_spam=true&trusted=false`;
    const res = await fetch(url);
    return await res.json();
  }

  async listCollectibles(
    gnosisSafe: string,
    network: string
  ): Promise<SafeCollectibleResponse[]> {
    const address = ethers.utils.getAddress(gnosisSafe);

    const url = `https://zero-gateway.azure-api.net/gnosis/${network}/safes/${address}/collectibles?exclude_spam=true&trusted=false`;
    const res = await fetch(url);
    return await res.json();
  }

  async listTransactions(
    gnosisSafe: string,
    network: string
  ): Promise<Transaction[]> {
    const address = ethers.utils.getAddress(gnosisSafe);

    const { results } = await getTransactionHistory(
      this.config.gateway,
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
