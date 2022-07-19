import { ethers } from 'ethers';

import ZDAORegistryClient from '../../client/ZDAORegistry';
import { NotInitializedError } from '../../types';
import { EthereumZDAOChefClient } from '../ethereum';

class GlobalClient {
  private static etherRpcProviderInst?: ethers.providers.JsonRpcProvider;
  private static zDAORegistryInst?: ZDAORegistryClient;
  private static ethereumZDAOChefInst?: EthereumZDAOChefClient;
  private static ipfsGatewayHost?: string;

  static get etherRpcProvider() {
    if (!GlobalClient.etherRpcProviderInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.etherRpcProviderInst;
  }

  static set etherRpcProvider(
    etherRpcProvider: ethers.providers.JsonRpcProvider
  ) {
    GlobalClient.etherRpcProviderInst = etherRpcProvider;
  }

  static get zDAORegistry() {
    if (!GlobalClient.zDAORegistryInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.zDAORegistryInst;
  }

  static set zDAORegistry(registry: ZDAORegistryClient) {
    GlobalClient.zDAORegistryInst = registry;
  }

  static get ethereumZDAOChef() {
    if (!GlobalClient.ethereumZDAOChefInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.ethereumZDAOChefInst;
  }

  static set ethereumZDAOChef(zDAOChef: EthereumZDAOChefClient) {
    GlobalClient.ethereumZDAOChefInst = zDAOChef;
  }

  static get ipfsGateway() {
    if (!GlobalClient.ipfsGatewayHost) {
      throw new NotInitializedError();
    }
    return GlobalClient.ipfsGatewayHost;
  }

  static set ipfsGateway(ipfsGateway: string) {
    GlobalClient.ipfsGatewayHost = ipfsGateway;
  }
}

export default GlobalClient;
