import { ethers } from 'ethers';

import GlobalClient from '../client/GlobalClient';
import IChildChainManagerAbi from '../config/abi/IChildChainManager.json';
import { IChildChainManager } from '../config/types/IChildChainManager';

class PolygonRegistryClient {
  protected readonly contract: IChildChainManager;

  constructor(address: string) {
    this.contract = new ethers.Contract(
      address,
      IChildChainManagerAbi.abi,
      GlobalClient.polyRpcProvider
    ) as IChildChainManager;
  }

  rootToChildToken(rootToken: string): Promise<string> {
    return this.contract.rootToChildToken(rootToken);
  }

  childToRootToken(childToken: string): Promise<string> {
    return this.contract.childToRootToken(childToken);
  }
}

export default PolygonRegistryClient;
