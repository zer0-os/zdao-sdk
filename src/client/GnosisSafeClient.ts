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
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { PlatformType } from '..';
import { ZDAOModule__factory } from '../config/types/factories/ZDAOModule__factory';
import { GnosisSafeConfig } from '../types';
import { graphQLQuery } from '../utilities/graphql';
import { EXECUTEDPROPOSALS_BY_QUERY } from './types';

class GnosisSafeClient {
  private readonly config: GnosisSafeConfig;
  private readonly graphQLClient: GraphQLClient;
  private readonly ipfsGateway: string;
  private readonly EMPTY_DATA = '0x';

  constructor(config: GnosisSafeConfig, ipfsGateway: string) {
    this.config = config;
    this.graphQLClient = new GraphQLClient(config.zDAOModuleSubgraphUri);
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

  async isProposalsExecuted(
    platformType: PlatformType,
    proposalHashes: BigNumber[]
  ): Promise<boolean[]> {
    const response = await graphQLQuery(
      this.graphQLClient,
      EXECUTEDPROPOSALS_BY_QUERY,
      {
        proposalHashes: proposalHashes.map((hash) => hash.toString()),
        platformType,
      }
    );
    const filtered = response.executedProposals.map(
      (proposal: any) => proposal.proposalId
    );
    return proposalHashes.map((hash) => filtered.indexOf(hash) >= 0);
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
    const safeService = new SafeService(this.config.serviceUri);
    const safe = await Safe.create({
      ethAdapter,
      safeAddress,
    });
    const safeSigner = new SafeEthersSigner(safe, safeService, signer.provider);

    const moduleInterface = new ethers.utils.Interface(ZDAOModule__factory.abi);
    const data = moduleInterface.encodeFunctionData(funcName, params);

    const module = this.config.zDAOModule;
    await safeSigner.sendTransaction({
      value,
      to: module,
      data,
    });
  }

  async listAssets(
    gnosisSafe: string,
    network: string,
    selectedCurrency = 'USD'
  ): Promise<SafeBalanceResponse> {
    const address = ethers.utils.getAddress(gnosisSafe);

    const url = `https://zero-service-gateway.azure-api.net/gnosis/${network}/safes/${address}/balances/${selectedCurrency}?exclude_spam=true&trusted=false`;
    const res = await fetch(url);
    return await res.json();
  }

  async listCollectibles(
    gnosisSafe: string,
    network: string
  ): Promise<SafeCollectibleResponse[]> {
    const address = ethers.utils.getAddress(gnosisSafe);

    const url = `https://zero-service-gateway.azure-api.net/gnosis/${network}/safes/${address}/collectibles?exclude_spam=true&trusted=false`;
    const res = await fetch(url);
    return await res.json();
  }

  async listTransactions(
    gnosisSafe: string,
    network: string
  ): Promise<Transaction[]> {
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
  }
}

export default GnosisSafeClient;
