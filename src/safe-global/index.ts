import { getAddress } from '@ethersproject/address';
import {
  SafeBalanceResponse,
  SafeCollectibleResponse,
  Transaction as Transaction,
  TransactionListItem as TransactionListItem,
} from '@safe-global/safe-gateway-typescript-sdk';
import fetch from 'cross-fetch';

import { errorMessageForError } from '../utilities';

class SafeGlobalClient {
  async listAssets(
    safeAddress: string,
    network: string,
    selectedCurrency = 'USD'
  ): Promise<SafeBalanceResponse> {
    try {
      const address = getAddress(safeAddress);

      const url = `https://zero-service-gateway.azure-api.net/gnosis/${network}/safes/${address}/balances/${selectedCurrency}?exclude_spam=true&trusted=false`;

      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message ?? error.error_description,
        })
      );
    }
  }

  async listCollectibles(
    safeAddress: string,
    network: string
  ): Promise<SafeCollectibleResponse[]> {
    try {
      const address = getAddress(safeAddress);

      const url = `https://zero-service-gateway.azure-api.net/gnosis/${network}/safes/${address}/collectibles?exclude_spam=true&trusted=false`;

      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message ?? error.error_description,
        })
      );
    }
  }

  async listTransactions(
    safeAddress: string,
    network: string
  ): Promise<Transaction[]> {
    try {
      const address = getAddress(safeAddress);

      const url = `https://zero-service-gateway.azure-api.net/gnosis/${network}/safes/${address}/transactions/history`;

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
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message ?? error.error_description,
        })
      );
    }
  }
}

export default SafeGlobalClient;