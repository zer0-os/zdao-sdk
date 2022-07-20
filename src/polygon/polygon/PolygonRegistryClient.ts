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

  rootToChildToken(rootToken: string): Promise<string> {
    return this.contract.rootToChildToken(rootToken);
  }

  childToRootToken(childToken: string): Promise<string> {
    return this.contract.childToRootToken(childToken);
  }
}

export default PolygonRegistryClient;
