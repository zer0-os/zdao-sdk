import { TransactionResponse } from '@ethersproject/abstract-provider';
import Safe from '@gnosis.pm/safe-core-sdk';
import { SafeEthersSigner, SafeService } from '@gnosis.pm/safe-ethers-adapters';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import {
  Erc20Transfer,
  Erc721Transfer,
  getBalances,
  getTransactionHistory,
  NativeCoinTransfer,
  SafeBalanceResponse,
  Transaction as GnosisTransaction,
  TransactionListItem as GnosisTransactionListItem,
  Transfer as GnosisTransfer,
  TransferInfo as GnosisTransferInfo,
} from '@gnosis.pm/safe-react-gateway-sdk';
import { BigNumberish, ethers } from 'ethers';

import TransferAbi from '../config/constants/abi/transfer.json';
import { zDAO } from '../snapshot-io/types';
import { GnosisSafeConfig, zDAOAssets } from '../types';
import {
  AssetType,
  Transaction,
  TransactionStatus,
  TransactionType,
  TransferInfo,
} from './types';

export const createClient = (config: GnosisSafeConfig, dao: zDAO) => {
  const listAssets = async (selectedCurrency = 'USD'): Promise<zDAOAssets> => {
    const safeAddress = ethers.utils.getAddress(dao.safeAddress);

    const balances: SafeBalanceResponse = await getBalances(
      config.gateway,
      safeAddress,
      dao.network,
      selectedCurrency,
      {
        exclude_spam: true,
        trusted: false,
      }
    );

    return {
      amountInUSD: Number(balances.fiatTotal),
      assets: balances.items.map((item) => ({
        type: item.tokenInfo.type as string as AssetType,
        address: item.tokenInfo.address,
        decimals: item.tokenInfo.decimals,
        symbol: item.tokenInfo.symbol,
        name: item.tokenInfo.name,
        logoUri: item.tokenInfo.logoUri ?? undefined,
        amount: item.balance,
        amountInUSD: Number(item.fiatBalance),
      })),
    };
  };

  const listTransactions = async (): Promise<Transaction[]> => {
    const safeAddress = ethers.utils.getAddress(dao.safeAddress);

    const { results } = await getTransactionHistory(
      config.gateway,
      dao.network,
      safeAddress
    );

    const filtered = results
      .filter(
        (tx: GnosisTransactionListItem) =>
          tx.type === 'TRANSACTION' &&
          tx.transaction.txInfo.type === 'Transfer' &&
          (tx.transaction.txInfo.direction === 'INCOMING' ||
            tx.transaction.txInfo.direction === 'OUTGOING')
      )
      .map((tx) => tx as GnosisTransaction);

    const mapToTransferInfo = (info: GnosisTransferInfo): TransferInfo => {
      if ((info.type as string) === AssetType.ERC20) {
        const typedInfo = info as Erc20Transfer;
        return {
          type: AssetType.ERC20,
          tokenAddress: typedInfo.tokenAddress,
          tokenName: typedInfo.tokenName ?? undefined,
          tokenSymbol: typedInfo.tokenSymbol ?? undefined,
          logoUri: typedInfo.logoUri ?? undefined,
          decimals: typedInfo.decimals ?? undefined,
          value: typedInfo.value,
        };
      } else if ((info.type as string) === AssetType.ERC721) {
        const typedInfo = info as Erc721Transfer;
        return {
          type: AssetType.ERC721,
          tokenAddress: typedInfo.tokenAddress,
          tokenId: typedInfo.tokenId,
          tokenName: typedInfo.tokenName ?? undefined,
          tokenSymbol: typedInfo.tokenSymbol ?? undefined,
          logoUri: typedInfo.logoUri ?? undefined,
        };
      } else {
        // AssetType.NATIVE_COIN
        const typedInfo = info as NativeCoinTransfer;
        return {
          type: AssetType.NATIVE_TOKEN,
          value: typedInfo.value,
        };
      }
    };

    return filtered.map((tx: GnosisTransaction) => {
      const txInfo = tx.transaction.txInfo as GnosisTransfer;
      return {
        type:
          txInfo.direction === 'INCOMING'
            ? TransactionType.RECEIVED
            : TransactionType.SENT,
        asset: mapToTransferInfo(txInfo.transferInfo),
        from: txInfo.sender.value,
        to: txInfo.recipient.value,
        created: new Date(tx.transaction.timestamp),
        status: tx.transaction.txStatus as string as TransactionStatus,
      };
    });
  };

  const isOwnerAddress = async (
    signer: ethers.Wallet,
    address: string
  ): Promise<boolean> => {
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safe = await Safe.create({
      ethAdapter,
      safeAddress: dao.safeAddress,
    });
    const owners = await safe.getOwners();
    if (!owners.find((owner) => owner === address)) {
      return false;
    }
    return true;
  };

  const transferERC20 = async (
    signer: ethers.Wallet,
    token: string,
    recipient: string,
    amount: BigNumberish
  ): Promise<TransactionResponse> => {
    const service = new SafeService(config.serviceUri);
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safe = await Safe.create({
      ethAdapter,
      safeAddress: dao.safeAddress,
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
  };

  const transferEther = async (
    signer: ethers.Wallet,
    recipient: string,
    amount: BigNumberish
  ): Promise<TransactionResponse> => {
    const service = new SafeService(config.serviceUri);
    const ethAdapter = new EthersAdapter({
      ethers,
      signer,
    });
    const safe = await Safe.create({
      ethAdapter,
      safeAddress: dao.safeAddress,
    });

    const safeSigner = new SafeEthersSigner(safe, service, signer.provider);
    return safeSigner.sendTransaction({ to: recipient, value: amount });
  };

  return {
    listAssets,
    listTransactions,
    isOwnerAddress,
    transferERC20,
    transferEther,
  };
};
