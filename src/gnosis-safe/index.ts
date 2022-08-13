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
import { GraphQLClient } from 'graphql-request';

import ZDAOModuleAbi from '../config/constants/abi/ZDAOModule.json';
import { GnosisSafeConfig, PlatformType } from '../types';
import { graphQLQuery } from '../utilities';
import { EXECUTEDPROPOSALS_BY_QUERY } from './types';

class GnosisSafeClient {
  private readonly _config: GnosisSafeConfig;
  private readonly EMPTY_DATA = '0x';
  private readonly _graphQLClient;

  constructor(config: GnosisSafeConfig) {
    this._config = config;

    this._graphQLClient = new GraphQLClient(config.zDAOModuleSubgraphUri);
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

  async isProposalsExecuted(
    platformType: PlatformType,
    proposalHashes: string[]
  ): Promise<boolean[]> {
    const response = await graphQLQuery(
      this._graphQLClient,
      EXECUTEDPROPOSALS_BY_QUERY,
      {
        id_in: proposalHashes.map(
          (proposalHash) => `${platformType}-${proposalHash}`
        ),
        platformType,
      }
    );
    const filtered = response.executedProposals.map(
      (proposal: any) => proposal.proposalId
    );
    return proposalHashes.map(
      (proposalHash) => filtered.indexOf(proposalHash) >= 0
    );
  }

  async proposeTxFromModule(
    safeAddress: string,
    signer: ethers.Signer,
    funcName: string,
    params: string[],
    value: BigNumberish = '0' // ETH amount to be transferred
  ) {
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

    const moduleInterface = new ethers.utils.Interface(ZDAOModuleAbi.abi);
    const data = moduleInterface.encodeFunctionData(funcName, params);

    const module = this._config.zDAOModule;
    await safeSigner.sendTransaction({
      value,
      to: module,
      data,
    });
  }

  async listAssets(
    safeAddress: string,
    network: string,
    selectedCurrency = 'USD'
  ): Promise<SafeBalanceResponse> {
    const address = ethers.utils.getAddress(safeAddress);

    const url = `https://zero-service-gateway.azure-api.net/gnosis/${network}/safes/${address}/balances/${selectedCurrency}?exclude_spam=true&trusted=false`;

    const res = await fetch(url);
    const data = await res.json();
    return data;
  }

  async listCollectibles(
    safeAddress: string,
    network: string
  ): Promise<SafeCollectibleResponse[]> {
    const address = ethers.utils.getAddress(safeAddress);

    const url = `https://zero-service-gateway.azure-api.net/gnosis/${network}/safes/${address}/collectibles?exclude_spam=true&trusted=false`;

    const res = await fetch(url);
    const data = await res.json();
    return data;
  }

  async listTransactions(
    safeAddress: string,
    network: string
  ): Promise<Transaction[]> {
    const address = ethers.utils.getAddress(safeAddress);

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
  }
}

export default GnosisSafeClient;
