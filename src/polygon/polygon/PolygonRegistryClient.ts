import { NetworkError } from '../../types';
import GlobalClient from '../client/GlobalClient';
import { IChildChainManager__factory } from '../config/types/factories/IChildChainManager__factory';
import { IChildChainManager } from '../config/types/IChildChainManager';

class PolygonRegistryClient {
  protected readonly contract: IChildChainManager;

  constructor(address: string) {
    this.contract = IChildChainManager__factory.connect(
      address,
      GlobalClient.polyRpcProvider
    );
  }

  async rootToChildToken(rootToken: string): Promise<string> {
    try {
      return await this.contract.rootToChildToken(rootToken);
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }

  async childToRootToken(childToken: string): Promise<string> {
    try {
      return await this.contract.childToRootToken(childToken);
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }
}

export default PolygonRegistryClient;
