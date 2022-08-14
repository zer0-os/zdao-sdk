import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import {
  ethereumZDAOConfig,
  zDAOModuleAddress,
  zDAOModuleSubgraphUri,
  zDAORegistryAddress,
  zDAORegistrySubgraphUri,
  zNSHubAddress,
} from '../../config';
import { FleekConfig, SupportedChainId } from '../../types';
import { SnapshotConfig } from '../types';

export interface ConfigParams {
  ethereumProvider: ethers.providers.Provider;

  /**
   * Fleek configuration to upload to IPFS
   */
  fleek: FleekConfig;

  ipfsGateway: string;
}

export const developmentConfiguration = ({
  ethereumProvider,
  fleek,
  ipfsGateway,
}: ConfigParams): SnapshotConfig => ({
  ethereum: ethereumZDAOConfig[SupportedChainId.RINKEBY],
  ethereumProvider,
  zNA: {
    zDAORegistry: zDAORegistryAddress[SupportedChainId.RINKEBY],
    subgraphUri: zDAORegistrySubgraphUri[SupportedChainId.RINKEBY],
    zNSHub: zNSHubAddress[SupportedChainId.RINKEBY],
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.rinkeby.gnosis.io',
    gateway: 'https://safe-client.staging.gnosisdev.com',
    zDAOModule: zDAOModuleAddress[SupportedChainId.RINKEBY],
    zDAOModuleSubgraphUri: zDAOModuleSubgraphUri[SupportedChainId.RINKEBY],
  },
  fleek,
  ipfsGateway,
  zNS: configuration.rinkebyConfiguration(ethereumProvider),
  isProd: false,
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
  },
});

export const productionConfiguration = ({
  ethereumProvider,
  fleek,
  ipfsGateway,
}: ConfigParams): SnapshotConfig => ({
  ethereum: ethereumZDAOConfig[SupportedChainId.MAINNET],
  ethereumProvider,
  zNA: {
    zDAORegistry: zDAORegistryAddress[SupportedChainId.MAINNET],
    subgraphUri: zDAORegistrySubgraphUri[SupportedChainId.MAINNET],
    zNSHub: zNSHubAddress[SupportedChainId.MAINNET],
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
    zDAOModule: zDAOModuleAddress[SupportedChainId.MAINNET],
    zDAOModuleSubgraphUri: zDAOModuleSubgraphUri[SupportedChainId.MAINNET],
  },
  fleek,
  ipfsGateway,
  zNS: configuration.mainnetConfiguration(ethereumProvider),
  isProd: true,
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
  },
});
