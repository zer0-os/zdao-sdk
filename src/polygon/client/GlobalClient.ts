import { ethers } from 'ethers';

import ZDAORegistryClient from '../../client/ZDAORegistry';
import { NotInitializedError } from '../../types';
import { EthereumZDAOChefClient } from '../ethereum';
import { PolygonZDAOChefClient } from '../polygon';
import { PolygonConfig } from '../types';
import RegistryClient from './RegistryClient';
import StakingClient from './StakingClient';

class GlobalClient {
  private static config: PolygonConfig;
  private static etherRpcProviderInst: ethers.providers.Provider;
  private static etherNetworkNumber: number;
  private static polyRpcProviderInst: ethers.providers.Provider;
  private static polyNetworkNumber: number;
  private static zDAORegistryInst?: ZDAORegistryClient;
  private static ethereumZDAOChefInst?: EthereumZDAOChefClient;
  private static polygonZDAOChefInst?: PolygonZDAOChefClient;
  private static stakingInst?: StakingClient;
  private static registryInst?: RegistryClient;
  private static ipfsGatewayHost?: string;

  static async initialize(config: PolygonConfig) {
    GlobalClient.config = config;
    GlobalClient.etherRpcProviderInst = config.ethereumProvider;
    const etherNetwork = await config.ethereumProvider.getNetwork();
    GlobalClient.etherNetworkNumber = etherNetwork.chainId;
    GlobalClient.polyRpcProviderInst = config.polygonProvider;
    const polyNetwork = await config.polygonProvider.getNetwork();
    GlobalClient.polyNetworkNumber = polyNetwork.chainId;
    GlobalClient.zDAORegistryInst = new ZDAORegistryClient(
      config.zNA,
      config.ethereumProvider
    );
    GlobalClient.ipfsGatewayHost = config.ipfsGateway;

    GlobalClient.ethereumZDAOChefInst = new EthereumZDAOChefClient(
      config.ethereum,
      config.ethereumProvider
    );
    GlobalClient.polygonZDAOChefInst = new PolygonZDAOChefClient(
      config.polygon,
      config.polygonProvider
    );
    GlobalClient.stakingInst = new StakingClient({
      address: config.polygon.staking,
    });
    GlobalClient.registryInst = new RegistryClient({
      address: config.polygon.childChainManager,
    });
  }

  static get etherRpcProvider() {
    if (!GlobalClient.etherRpcProviderInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.etherRpcProviderInst;
  }

  static get etherNetwork() {
    return GlobalClient.etherNetworkNumber;
  }

  static get polyRpcProvider() {
    if (!GlobalClient.polyRpcProviderInst) {
      throw new NotInitializedError();
    }
    return GlobalClient.polyRpcProviderInst;
  }

  static get polyNetwork() {
    return GlobalClient.polyNetworkNumber;
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
