import { ethers } from 'ethers';

import { NotInitializedError } from '../../types';
import { EtherZDAOChefClient } from '../ethereum';
import { PolyZDAOChefClient } from '../polygon';
import RegistryClient from './RegistryClient';
import StakingClient from './StakingClient';
import ZNSHubClient from './ZNSHubClient';

class GlobalClient {
  private static _etherRpcProvider?: ethers.providers.JsonRpcProvider;
  private static _polyRpcProvider?: ethers.providers.JsonRpcProvider;
  private static _etherZDAOChef?: EtherZDAOChefClient;
  private static _polyZDAOChef?: PolyZDAOChefClient;
  private static _znsHub?: ZNSHubClient;
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

  static get etherZDAOChef() {
    if (!GlobalClient._etherZDAOChef) {
      throw new NotInitializedError();
    }
    return GlobalClient._etherZDAOChef;
  }

  static set etherZDAOChef(etherZDAOChef: EtherZDAOChefClient) {
    GlobalClient._etherZDAOChef = etherZDAOChef;
  }

  static get polyZDAOChef() {
    if (!GlobalClient._polyZDAOChef) {
      throw new NotInitializedError();
    }
    return GlobalClient._polyZDAOChef;
  }

  static set polyZDAOChef(polyZdAOChef: PolyZDAOChefClient) {
    GlobalClient._polyZDAOChef = polyZdAOChef;
  }

  static get znsHub() {
    if (!GlobalClient._znsHub) {
      throw new NotInitializedError();
    }
    return GlobalClient._znsHub;
  }

  static set znsHub(znsHub: ZNSHubClient) {
    GlobalClient._znsHub = znsHub;
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
