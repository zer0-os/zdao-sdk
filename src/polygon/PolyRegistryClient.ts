import { ethers } from 'ethers';

import GlobalClient from '../client/GlobalClient';
import IChildChainManagerAbi from '../config/abi/IChildChainManager.json';
import { IChildChainManager } from '../config/types/IChildChainManager';
import { DAOConfig } from '../types';

class PolyRegistryClient {
  private readonly _config: DAOConfig;
  protected readonly _contract: IChildChainManager;

  constructor(config: DAOConfig, address: string) {
    this._config = config;
    this._contract = new ethers.Contract(
      address,
      IChildChainManagerAbi.abi,
      GlobalClient.polyRpcProvider
    ) as IChildChainManager;
  }

  rootToChildToken(rootToken: string): Promise<string> {
    return this._contract.rootToChildToken(rootToken);
  }

  childToRootToken(childToken: string): Promise<string> {
    return this._contract.childToRootToken(childToken);
  }
}

export default PolyRegistryClient;
