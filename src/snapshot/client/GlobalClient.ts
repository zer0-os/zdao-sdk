import { ethers } from 'ethers';

import ZDAORegistryClient from '../../client/ZDAORegistry';
import { NotInitializedError } from '../../types';
import { EthereumZDAOChefClient } from '../ethereum';
import { SnapshotConfig } from '../types';

class GlobalClient {
  private static config: SnapshotConfig;
  private static etherRpcProviderInst: ethers.providers.Provider;
  private static etherNetworkNumber: number;
  private static zDAORegistryInst?: ZDAORegistryClient;
  private static ethereumZDAOChefInst?: EthereumZDAOChefClient;
  private static ipfsGatewayHost?: string;

  static async initialize(config: SnapshotConfig) {
    GlobalClient.config = config;
    GlobalClient.etherRpcProviderInst = config.ethereumProvider;
    const network = await config.ethereumProvider.getNetwork();
    GlobalClient.etherNetworkNumber = network.chainId;
    GlobalClient.zDAORegistryInst = new ZDAORegistryClient(
      config.zNA,
      config.ethereumProvider
    );
    GlobalClient.ethereumZDAOChefInst = new EthereumZDAOChefClient(
      config.ethereum,
      config.ethereumProvider
    );
    GlobalClient.ipfsGatewayHost = config.ipfsGateway;
  }

  static get etherRpcProvider() {
    if (!GlobalClient.etherRpcProviderInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.etherRpcProviderInst;
  }

  static get etherNetwork() {
    return GlobalClient.etherNetworkNumber;
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
