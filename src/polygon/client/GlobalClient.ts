import { ethers } from 'ethers';

import ZDAORegistryClient from '../../client/ZDAORegistry';
import { NotInitializedError } from '../../types';
import { EthereumZDAOChefClient } from '../ethereum';
import { PolygonZDAOChefClient } from '../polygon';
import { PolygonConfig, StakingProperties } from '../types';
import RegistryClient from './RegistryClient';
import StakingClient from './StakingClient';

class GlobalClient {
  private static config: PolygonConfig;
  private static etherRpcProviderInst?: ethers.providers.JsonRpcProvider;
  private static polyRpcProviderInst?: ethers.providers.JsonRpcProvider;
  private static zDAORegistryInst?: ZDAORegistryClient;
  private static ethereumZDAOChefInst?: EthereumZDAOChefClient;
  private static polygonZDAOChefInst?: PolygonZDAOChefClient;
  private static stakingInst?: StakingClient;
  private static registryInst?: RegistryClient;
  private static ipfsGatewayHost?: string;

  static async initialize(config: PolygonConfig) {
    GlobalClient.config = config;
    GlobalClient.etherRpcProviderInst = new ethers.providers.JsonRpcProvider(
      config.ethereum.rpcUrl,
      config.ethereum.network
    );
    GlobalClient.polyRpcProviderInst = new ethers.providers.JsonRpcProvider(
      config.polygon.rpcUrl,
      config.polygon.network
    );
    GlobalClient.zDAORegistryInst = new ZDAORegistryClient(config.zNA);
    GlobalClient.ipfsGatewayHost = config.ipfsGateway;

    GlobalClient.ethereumZDAOChefInst = new EthereumZDAOChefClient(
      config.ethereum
    );
    GlobalClient.polygonZDAOChefInst = new PolygonZDAOChefClient(
      config.polygon
    );

    const promises: Promise<any>[] = [
      GlobalClient.polygonZDAOChef.getStakingProperties(),
      GlobalClient.polygonZDAOChef.getRegistryAddress(),
    ];
    const results = await Promise.all(promises);

    const stakingProperties = results[0] as StakingProperties;
    GlobalClient.stakingInst = new StakingClient(stakingProperties);

    const registryAddress = results[1] as string;
    GlobalClient.registryInst = new RegistryClient(registryAddress);
  }

  static get etherRpcProvider() {
    if (!GlobalClient.etherRpcProviderInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.etherRpcProviderInst;
  }

  static get polyRpcProvider() {
    if (!GlobalClient.polyRpcProviderInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.polyRpcProviderInst;
  }

  static get zDAORegistry() {
    if (!GlobalClient.zDAORegistryInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.zDAORegistryInst;
  }

  static get ethereumZDAOChef() {
    if (!GlobalClient.ethereumZDAOChefInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.ethereumZDAOChefInst;
  }

  static get polygonZDAOChef() {
    if (!GlobalClient.polygonZDAOChefInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.polygonZDAOChefInst;
  }

  static get staking() {
    if (!GlobalClient.stakingInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.stakingInst;
  }

  static get registry() {
    if (!GlobalClient.registryInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.registryInst;
  }

  static get ipfsGateway() {
    if (!GlobalClient.ipfsGatewayHost) {
      throw new NotInitializedError();
    }
    return GlobalClient.ipfsGatewayHost;
  }
}

export default GlobalClient;
