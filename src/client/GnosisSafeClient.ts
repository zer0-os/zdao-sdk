import {
  SafeBalanceResponse,
  SafeCollectibleResponse,
  Transaction as Transaction,
  TransactionListItem as TransactionListItem,
} from '@gnosis.pm/safe-react-gateway-sdk';
import fetch from 'cross-fetch';
import { ethers } from 'ethers';

import { GnosisSafeConfig, NetworkError } from '../types';

class GnosisSafeClient {
  private readonly config: GnosisSafeConfig;

  constructor(config: GnosisSafeConfig) {
    this.config = config;
  }

  async listAssets(
    gnosisSafe: string,
    network: string,
    selectedCurrency = 'USD'
  ): Promise<SafeBalanceResponse> {
    try {
      const address = ethers.utils.getAddress(gnosisSafe);

      const url = `https://zero-service-gateway.azure-api.net/gnosis/${network}/safes/${address}/balances/${selectedCurrency}?exclude_spam=true&trusted=false`;
      const res = await fetch(url);
      return await res.json();
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }

  async listCollectibles(
    gnosisSafe: string,
    network: string
  ): Promise<SafeCollectibleResponse[]> {
    try {
      const address = ethers.utils.getAddress(gnosisSafe);

      const url = `https://zero-service-gateway.azure-api.net/gnosis/${network}/safes/${address}/collectibles?exclude_spam=true&trusted=false`;
      const res = await fetch(url);
      return await res.json();
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }

  async listTransactions(
    gnosisSafe: string,
    network: string
  ): Promise<Transaction[]> {
    try {
      const address = ethers.utils.getAddress(gnosisSafe);

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
      throw new NetworkError(error.message);
    }
  }
}

export default GnosisSafeClient;
