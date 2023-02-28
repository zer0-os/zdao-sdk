import { getAddress } from '@ethersproject/address';
import {
  SafeBalanceResponse,
  SafeCollectibleResponse,
  Transaction as Transaction,
  TransactionListItem as TransactionListItem,
} from '@safe-global/safe-gateway-typescript-sdk';
import fetch from 'cross-fetch';

import { Maybe } from '../types';
import { errorMessageForError } from '../utilities';
import { SafeGlobalAccountDetails } from './types';

class SafeGlobalClient {
  async getAccountDetails(
    network: string,
    safeAddress: string
  ): Promise<Maybe<SafeGlobalAccountDetails>> {
    try {
      // https://safe-client.safe.global/v1/chains/1/safes/0x2A83Aaf231644Fa328aE25394b0bEB17eBd12150

      const address = getAddress(safeAddress);
      const url = `https://safe-client.safe.global/v1/chains/${network}/safes/${address}`;

      const res = await fetch(url);
      const data = await res.json();
      const code = data.code ? Number(data.code) : 0;
      if (code > 0) {
        return undefined;
      }

      return {
        network,
        safeAddress: address,
        owners: data.owners.map((item: any) => item.value),
        threshold: Number(data.threshold),
      } as SafeGlobalAccountDetails;
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message ?? error.error_description,
        })
      );
    }
  }

  async listAssets(
    network: string,
    safeAddress: string,
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
    network: string,
    safeAddress: string
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
    network: string,
    safeAddress: string
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
