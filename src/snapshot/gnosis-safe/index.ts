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
import { BigNumberish, ethers } from 'ethers';

import ERC20Abi from '../config/constants/abi/ERC20.json';
import { GnosisSafeConfig } from '../types';
import { ipfsJson } from '../utilities/ipfs';

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
    const safeService = new SafeServiceClient(this._config.serviceUri);
    const safe = await Safe.create({
      ethAdapter,
      safeAddress,
    });

    // const service = new SafeService(this._config.serviceUri);
    // const safeSigner = new SafeEthersSigner(safe, service, signer.provider);
    // return safeSigner.sendTransaction({ to: recipient, value: amount });

    const signerAddress = await signer.getAddress();
    const nonce = await safeService.getNextNonce(safeAddress);
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
      nonce: Number(nonce), // Optional
    };

    const safeTransaction = await safe.createTransaction(transaction);
    await safe.signTransaction(safeTransaction);

    const safeTxHash = await safe.getTransactionHash(safeTransaction);
    await safeService.proposeTransaction({
      safeAddress,
      senderAddress: signerAddress,
      safeTransaction,
      safeTxHash,
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
    const safeService = new SafeServiceClient(this._config.serviceUri);
    const safe = await Safe.create({
      ethAdapter,
      safeAddress,
    });

    const signerAddress = await signer.getAddress();
    const erc20Interface = new ethers.utils.Interface(ERC20Abi);
    const txData = erc20Interface.encodeFunctionData('transfer', [
      recipient,
      amount,
    ]);
    const nonce = await safeService.getNextNonce(safeAddress);
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
      nonce: Number(nonce), // Optional
    };

    const safeTransaction = await safe.createTransaction(transaction);
    await safe.signTransaction(safeTransaction);

    const safeTxHash = await safe.getTransactionHash(safeTransaction);
    await safeService.proposeTransaction({
      safeAddress,
      senderAddress: signerAddress,
      safeTransaction,
      safeTxHash,
    });

    // const service = new SafeService(this._config.serviceUri);
    // const safeSigner = new SafeEthersSigner(safe, service, signer.provider);
    // const transferContract = new ethers.Contract(
    //   token,
    //   TransferAbi,
    //   safeSigner
    // );
    // return await transferContract
    //   .connect(safeSigner)
    //   .transfer(recipient, amount);
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

    // todo, if empty uri, then should integrate with smart contract and get token uri

    // if not empty uri, then should fetch data from ipfs uri
    const needToPatch = collectibles.filter(
      (collectible) =>
        Object.keys(collectible.metadata).length < 1 &&
        collectible.uri.length > 0
    );

    const promises: Promise<{ [key: string]: string }>[] = [];
    for (const collectible of needToPatch) {
      promises.push(ipfsJson(collectible.uri, this._config.ipfsGateway));
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
