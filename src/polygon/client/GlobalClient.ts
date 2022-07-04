import { ethers } from 'ethers';

import ZDAORegistryClient from '../../client/ZDAORegistry';
import { NotInitializedError } from '../../types';
import { EthereumZDAOChefClient } from '../ethereum';
import { PolygonZDAOChefClient } from '../polygon';
import RegistryClient from './RegistryClient';
import StakingClient from './StakingClient';

class GlobalClient {
  private static _etherRpcProvider?: ethers.providers.JsonRpcProvider;
  private static _polyRpcProvider?: ethers.providers.JsonRpcProvider;
  private static _zDAORegistry?: ZDAORegistryClient;
  private static _ethereumZDAOChef?: EthereumZDAOChefClient;
  private static _polygonZDAOChef?: PolygonZDAOChefClient;
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

  static get ethereumZDAOChef() {
    if (!GlobalClient._ethereumZDAOChef) {
      throw new NotInitializedError();
    }
    return GlobalClient._ethereumZDAOChef;
  }

  static set ethereumZDAOChef(ethereumZDAOChef: EthereumZDAOChefClient) {
    GlobalClient._ethereumZDAOChef = ethereumZDAOChef;
  }

  static get polygonZDAOChef() {
    if (!GlobalClient._polygonZDAOChef) {
      throw new NotInitializedError();
    }
    return GlobalClient._polygonZDAOChef;
  }

  static set polygonZDAOChef(polyZDAOChef: PolygonZDAOChefClient) {
    GlobalClient._polygonZDAOChef = polyZDAOChef;
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
