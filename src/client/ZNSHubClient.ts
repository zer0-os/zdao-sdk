import { Provider } from '@ethersproject/providers';

import { IZNSHub__factory } from '../config/types/factories/IZNSHub__factory';
import { IZNSHub } from '../config/types/IZNSHub';
import { zNAConfig, zNAId } from '../types';

class ZNSHubClient {
  protected static contract: IZNSHub;

  static initialize(config: zNAConfig, provider: Provider) {
    ZNSHubClient.contract = IZNSHub__factory.connect(config.zNSHub, provider);
  }

  static async ownerOf(zNAId: zNAId): Promise<string> {
    try {
      return await ZNSHubClient.contract.ownerOf(zNAId);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  static async isOwnerOf(zNAId: zNAId, account: string): Promise<boolean> {
    try {
      const owner = await ZNSHubClient.contract.ownerOf(zNAId);
      return owner.toLowerCase() === account.toLowerCase();
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default ZNSHubClient;
