import { ethers } from 'ethers';

import ZDAORegistryClient from '../../client/ZDAORegistry';
import { NotInitializedError } from '../../types';
import { EthereumZDAOChefClient } from '../ethereum';
import { PolygonZDAOChefClient } from '../polygon';
import RegistryClient from './RegistryClient';
import StakingClient from './StakingClient';

class GlobalClient {
  private static etherRpcProviderInst?: ethers.providers.JsonRpcProvider;
  private static polyRpcProviderInst?: ethers.providers.JsonRpcProvider;
  private static zDAORegistryInst?: ZDAORegistryClient;
  private static ethereumZDAOChefInst?: EthereumZDAOChefClient;
  private static polygonZDAOChefInst?: PolygonZDAOChefClient;
  private static stakingInst?: StakingClient;
  private static registryInst?: RegistryClient;
  private static ipfsGatewayHost?: string;

  static get etherRpcProvider() {
    if (!GlobalClient.etherRpcProviderInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.etherRpcProviderInst;
  }

  static set etherRpcProvider(
    etherRpcProvider: ethers.providers.JsonRpcProvider
  ) {
    GlobalClient.etherRpcProviderInst = etherRpcProvider;
  }

  static get polyRpcProvider() {
    if (!GlobalClient.polyRpcProviderInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.polyRpcProviderInst;
  }

  static set polyRpcProvider(
    polyRpcProvider: ethers.providers.JsonRpcProvider
  ) {
    GlobalClient.polyRpcProviderInst = polyRpcProvider;
  }

  static get zDAORegistry() {
    if (!GlobalClient.zDAORegistryInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.zDAORegistryInst;
  }

  static set zDAORegistry(registry: ZDAORegistryClient) {
    GlobalClient.zDAORegistryInst = registry;
  }

  static get ethereumZDAOChef() {
    if (!GlobalClient.ethereumZDAOChefInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.ethereumZDAOChefInst;
  }

  static set ethereumZDAOChef(ethereumZDAOChef: EthereumZDAOChefClient) {
    GlobalClient.ethereumZDAOChefInst = ethereumZDAOChef;
  }

  static get polygonZDAOChef() {
    if (!GlobalClient.polygonZDAOChefInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.polygonZDAOChefInst;
  }

  static set polygonZDAOChef(polyZDAOChef: PolygonZDAOChefClient) {
    GlobalClient.polygonZDAOChefInst = polyZDAOChef;
  }

  static get staking() {
    if (!GlobalClient.stakingInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.stakingInst;
  }

  static set staking(staking: StakingClient) {
    GlobalClient.stakingInst = staking;
  }

  static get registry() {
    if (!GlobalClient.registryInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.registryInst;
  }

  static set registry(registry: RegistryClient) {
    GlobalClient.registryInst = registry;
  }

  static get ipfsGateway() {
    if (!GlobalClient.ipfsGatewayHost) {
      throw new NotInitializedError();
    }
    return GlobalClient.ipfsGatewayHost;
  }

  static set ipfsGateway(ipfsGateway: string) {
    GlobalClient.ipfsGatewayHost = ipfsGateway;
  }
}

export default GlobalClient;
