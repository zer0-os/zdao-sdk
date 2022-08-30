import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import {
  zDAORegistryAddress,
  zDAORegistrySubgraphUri,
  zNSHubAddress,
} from '../../config';
import { EthereumDAOConfig, FleekConfig, SupportedChainId } from '../../types';
import { SnapshotConfig } from '../types';

export const ethereumZDAOConfig: { [chainId: number]: EthereumDAOConfig } = {
  [SupportedChainId.MAINNET]: {
    zDAOChef: '0x7701913b65C9bCDa4d353F77EC12123d57D77f1e', // todo
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry',
  },
  [SupportedChainId.RINKEBY]: {
    zDAOChef: '0x53A9C5756a28B853Bb4ae645e26bBD65a4115FCA', // todo
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/deep-quality-dev/zdao-registry-rinkeby',
  },
};

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
  ipfsGateway = 'zer0.infura-ipfs.io',
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
  ipfsGateway = 'zer0.infura-ipfs.io',
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
  },
  fleek,
  ipfsGateway,
  zNS: configuration.mainnetConfiguration(ethereumProvider),
  isProd: true,
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
  },
});
