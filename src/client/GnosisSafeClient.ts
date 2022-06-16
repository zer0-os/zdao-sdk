import Safe from '@gnosis.pm/safe-core-sdk';
import { SafeTransactionDataPartial } from '@gnosis.pm/safe-core-sdk-types';
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
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import { ethers } from 'ethers';

import ERC20Abi from '../config/abi/ERC20.json';
import { GnosisSafeConfig } from '../types';
import IPFSClient from './IPFSClient';

class GnosisSafeClient {
  private readonly _config: GnosisSafeConfig;
  private readonly _ipfsGateway: string;
  private readonly EMPTY_DATA = '0x';

  constructor(config: GnosisSafeConfig, ipfsGateway: string) {
    this._config = config;
    this._ipfsGateway = ipfsGateway;
  }

  get config() {
    return this._config;
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
    const safeService = new SafeServiceClient(this._config.serviceUri);
    const safe = await Safe.create({
      ethAdapter,
      safeAddress: gnosisSafe,
    });

    const signerAddress = await signer.getAddress();
    // const nonce = await safeService.getNextNonce(gnosisSafe);
    const transaction: SafeTransactionDataPartial = {
      to: recipient,
      data: this.EMPTY_DATA,
      value: amount.toString(),
      operation: 0, // Optional
      safeTxGas: 0, // Optional
      baseGas: 0, // Optional
      gasPrice: 0, // Optional
      gasToken: '0x0000000000000000000000000000000000000000', // Optional
      refundReceiver: '0x0000000000000000000000000000000000000000', // Optional
      // nonce: Number(nonce), // Optional
    };

    const safeTransaction = await safe.createTransaction(transaction);
    await safe.signTransaction(safeTransaction);

    const safeTxHash = await safe.getTransactionHash(safeTransaction);
    await safeService.proposeTransaction({
      safeAddress: gnosisSafe,
      senderAddress: signerAddress,
      safeTransaction,
      safeTxHash,
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
    const safeService = new SafeServiceClient(this._config.serviceUri);
    const safe = await Safe.create({
      ethAdapter,
      safeAddress: gnosisSafe,
    });

    const signerAddress = await signer.getAddress();
    const erc20Interface = new ethers.utils.Interface(ERC20Abi);
    const txData = erc20Interface.encodeFunctionData('transfer', [
      recipient,
      amount,
    ]);
    // const nonce = await safeService.getNextNonce(gnosisSafe);
    const transaction: SafeTransactionDataPartial = {
      to: token,
      data: txData,
      value: '0',
      operation: 0, // Optional
      safeTxGas: 0, // Optional
      baseGas: 0, // Optional
      gasPrice: 0, // Optional
      gasToken: '0x0000000000000000000000000000000000000000', // Optional
      refundReceiver: '0x0000000000000000000000000000000000000000', // Optional
      // nonce: Number(nonce), // Optional
    };

    const safeTransaction = await safe.createTransaction(transaction);
    await safe.signTransaction(safeTransaction);

    const safeTxHash = await safe.getTransactionHash(safeTransaction);
    await safeService.proposeTransaction({
      safeAddress: gnosisSafe,
      senderAddress: signerAddress,
      safeTransaction,
      safeTxHash,
    });
  }

  async listAssets(
    gnosisSafe: string,
    network: string,
    selectedCurrency = 'USD'
  ): Promise<SafeBalanceResponse> {
    const address = ethers.utils.getAddress(gnosisSafe);

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
    gnosisSafe: string,
    network: string
  ): Promise<SafeCollectibleResponse[]> {
    const address = ethers.utils.getAddress(gnosisSafe);

    const collectibles = await getCollectibles(
      this._config.gateway,
      network,
      address,
      {
        exclude_spam: true,
        trusted: false,
      }
    );

    // todo, if empty uri, then should integrate with smart contract and get token uri

    // if not empty uri, then should fetch data from ipfs uri
    const needToPatch = collectibles.filter(
      (collectible) =>
        Object.keys(collectible.metadata).length < 1 &&
        collectible.uri.length > 0
    );

    const promises: Promise<{ [key: string]: string }>[] = [];
    for (const collectible of needToPatch) {
      promises.push(IPFSClient.getJson(collectible.uri, this._ipfsGateway));
    }
    const result: { [key: string]: string }[] = await Promise.all(promises);
    for (const index in needToPatch) {
      const patch = collectibles.find(
        (collectible) => collectible.uri === needToPatch[index].uri
      );
      if (patch) {
        patch.metadata = result[index];
      }
    }

    return collectibles;
  }

  async listTransactions(
    gnosisSafe: string,
    network: string
  ): Promise<Transaction[]> {
    const address = ethers.utils.getAddress(gnosisSafe);

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
