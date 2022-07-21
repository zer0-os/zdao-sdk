import { ethers } from 'ethers';

import { IZNSHub__factory } from '../config/types/factories/IZNSHub__factory';
import { IZNSHub } from '../config/types/IZNSHub';
import { zNAConfig, zNAId } from '../types';

class ZNSHubClient {
  protected static contract: IZNSHub;

  static initialize(config: zNAConfig) {
    ZNSHubClient.contract = IZNSHub__factory.connect(
      config.zNSHub,
      new ethers.providers.JsonRpcProvider(config.rpcUrl, config.network)
    );
  }

  static async ownerOf(zNAId: zNAId): Promise<string> {
    return ZNSHubClient.contract.ownerOf(zNAId);
  }

  static async isOwnerOf(zNAId: zNAId, account: string): Promise<boolean> {
    const owner = await ZNSHubClient.contract.ownerOf(zNAId);
    return owner.toLowerCase() === account.toLowerCase();
  }
}

export default ZNSHubClient;
