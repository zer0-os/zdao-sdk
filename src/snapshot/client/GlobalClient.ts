import { ethers } from 'ethers';

import { NotInitializedError } from '../../types';

class GlobalClient {
  private static _etherRpcProvider?: ethers.providers.JsonRpcProvider;
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
