import { ethers } from 'ethers';

import ZDAORegistryClient from '../../client/ZDAORegistry';
import { NotInitializedError } from '../../types';
import { ZDAOChefClient } from '../ethereum';

class GlobalClient {
  private static _etherRpcProvider?: ethers.providers.JsonRpcProvider;
  private static _zDAORegistry?: ZDAORegistryClient;
  private static _rootZDAOChef?: ZDAOChefClient;
  private static _ipfsGateway?: string;

  static get etherRpcProvider() {
    if (!GlobalClient._etherRpcProvider) {
      throw new NotInitializedError();
    }
    return GlobalClient._etherRpcProvider;
  }

  static set etherRpcProvider(
    etherRpcProvider: ethers.providers.JsonRpcProvider
  ) {
    GlobalClient._etherRpcProvider = etherRpcProvider;
  }

  static get zDAORegistry() {
    if (!GlobalClient._zDAORegistry) {
      throw new NotInitializedError();
    }
    return GlobalClient._zDAORegistry;
  }

  static set zDAORegistry(registry: ZDAORegistryClient) {
    GlobalClient._zDAORegistry = registry;
  }

  static get rootZDAOChef() {
    if (!GlobalClient._rootZDAOChef) {
      throw new NotInitializedError();
    }
    return GlobalClient._rootZDAOChef;
  }

  static set rootZDAOChef(zDAOChef: ZDAOChefClient) {
    GlobalClient._rootZDAOChef = zDAOChef;
  }

  static get ipfsGateway() {
    if (!GlobalClient._ipfsGateway) {
      throw new NotInitializedError();
    }
    return GlobalClient._ipfsGateway;
  }

  static set ipfsGateway(ipfsGateway: string) {
    GlobalClient._ipfsGateway = ipfsGateway;
  }
}

export default GlobalClient;
