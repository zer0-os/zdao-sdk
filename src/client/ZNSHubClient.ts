import { ethers } from 'ethers';

import IZNSHubAbi from '../config/abi/IZNSHub.json';
import { IZNSHub } from '../config/types/IZNSHub';
import { zNAConfig, zNAId } from '../types';

class ZNSHubClient {
  protected static _contract: IZNSHub;

  static initialize(config: zNAConfig) {
    ZNSHubClient._contract = new ethers.Contract(
      config.zNSHub,
      IZNSHubAbi.abi,
      new ethers.providers.JsonRpcProvider(config.rpcUrl, config.network)
    ) as IZNSHub;
  }

  static async ownerOf(zNAId: zNAId): Promise<string> {
    return ZNSHubClient._contract.ownerOf(zNAId);
  }

  static async isOwnerOf(zNAId: zNAId, account: string): Promise<boolean> {
    const owner = await ZNSHubClient._contract.ownerOf(zNAId);
    return owner.toLowerCase() === account.toLowerCase();
  }
}

export default ZNSHubClient;
