import Safe from '@gnosis.pm/safe-core-sdk';
import { SafeEthersSigner, SafeService } from '@gnosis.pm/safe-ethers-adapters';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import {
  getBalances,
  getCollectibles,
  getTransactionHistory,
  SafeBalanceResponse,
  SafeCollectibleResponse,
  Transaction as Transaction,
  TransactionListItem as TransactionListItem,
} from '@gnosis.pm/safe-react-gateway-sdk';
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

  async listCollectibles(
    safeAddress: string,
    network: string
  ): Promise<SafeCollectibleResponse[]> {
    const address = ethers.utils.getAddress(safeAddress);

    const collectibles = await getCollectibles(
      this._config.gateway,
      network,
      address,
      {
        exclude_spam: true,
        trusted: false,
      }
    );

    return collectibles;
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
