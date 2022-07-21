import { ethers } from 'ethers';

import ZDAORegistryClient from '../../client/ZDAORegistry';
import { NotInitializedError } from '../../types';
import { EthereumZDAOChefClient } from '../ethereum';
import { SnapshotConfig } from '../types';

class GlobalClient {
  private static config: SnapshotConfig;
  private static etherRpcProviderInst?: ethers.providers.JsonRpcProvider;
  private static zDAORegistryInst?: ZDAORegistryClient;
  private static ethereumZDAOChefInst?: EthereumZDAOChefClient;
  private static ipfsGatewayHost?: string;

  static initialize(config: SnapshotConfig) {
    GlobalClient.config = config;
    GlobalClient.etherRpcProviderInst = new ethers.providers.JsonRpcProvider(
      this.config.ethereum.rpcUrl,
      this.config.ethereum.network
    );
    GlobalClient.zDAORegistryInst = new ZDAORegistryClient(config.zNA);
    GlobalClient.ethereumZDAOChefInst = new EthereumZDAOChefClient(
      config.ethereum
    );
    GlobalClient.ipfsGatewayHost = config.ipfsGateway;
  }

  static get etherRpcProvider() {
    if (!GlobalClient.etherRpcProviderInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.etherRpcProviderInst;
  }

  static get zDAORegistry() {
    if (!GlobalClient.zDAORegistryInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.zDAORegistryInst;
  }

  static get ethereumZDAOChef() {
    if (!GlobalClient.ethereumZDAOChefInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.ethereumZDAOChefInst;
  }

  static get ipfsGateway() {
    if (!GlobalClient.ipfsGatewayHost) {
      throw new NotInitializedError();
    }
    return GlobalClient.ipfsGatewayHost;
  }
}

export default GlobalClient;
