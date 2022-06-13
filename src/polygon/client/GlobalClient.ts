import { ethers } from 'ethers';

import ZDAORegistryClient from '../../client/ZDAORegistry';
import { NotInitializedError } from '../../types';
import { RootZDAOChefClient } from '../ethereum';
import { ChildZDAOChefClient } from '../polygon';
import RegistryClient from './RegistryClient';
import StakingClient from './StakingClient';

class GlobalClient {
  private static _etherRpcProvider?: ethers.providers.JsonRpcProvider;
  private static _polyRpcProvider?: ethers.providers.JsonRpcProvider;
  private static _zDAORegistry?: ZDAORegistryClient;
  private static _rootZDAOChef?: RootZDAOChefClient;
  private static _childZDAOChef?: ChildZDAOChefClient;
  private static _staking?: StakingClient;
  private static _registry?: RegistryClient;
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

  static get polyRpcProvider() {
    if (!GlobalClient._polyRpcProvider) {
      throw new NotInitializedError();
    }
    return GlobalClient._polyRpcProvider;
  }

  static set polyRpcProvider(
    polyRpcProvider: ethers.providers.JsonRpcProvider
  ) {
    GlobalClient._polyRpcProvider = polyRpcProvider;
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

  static set rootZDAOChef(rootZDAOChef: RootZDAOChefClient) {
    GlobalClient._rootZDAOChef = rootZDAOChef;
  }

  static get childZDAOChef() {
    if (!GlobalClient._childZDAOChef) {
      throw new NotInitializedError();
    }
    return GlobalClient._childZDAOChef;
  }

  static set childZDAOChef(polyZdAOChef: ChildZDAOChefClient) {
    GlobalClient._childZDAOChef = polyZdAOChef;
  }

  static get staking() {
    if (!GlobalClient._staking) {
      throw new NotInitializedError();
    }
    return GlobalClient._staking;
  }

  static set staking(staking: StakingClient) {
    GlobalClient._staking = staking;
  }

  static get registry() {
    if (!GlobalClient._registry) {
      throw new NotInitializedError();
    }
    return GlobalClient._registry;
  }

  static set registry(registry: RegistryClient) {
    GlobalClient._registry = registry;
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
