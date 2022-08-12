import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import {
  ethereumZDAOConfig,
  zDAOModuleAddress,
  zDAOModuleSubgraphUri,
  zDAORegistryAddress,
  zNSHubAddress,
} from '../../config';
import { FleekConfig, SupportedChainId } from '../../types';
import { PolygonConfig, ProofConfig } from '../types';

const polygonZDAOConfig = {
  [SupportedChainId.MUMBAI]: {
    zDAOChef: '0xEf26Fd04017578E6E4258204F89aC74ED46Cf677', // todo
    blockNumber: 27589971, // todo
  },
  [SupportedChainId.POLYGON]: {
    zDAOChef: '', // todo
    blockNumber: 0, // todo
  },
};

export interface ConfigParams {
  ethereumProvider: ethers.providers.Provider;

  polygonProvider: ethers.providers.Provider;

  /**
   * Proof configuration for @maticnetwork/maticjs
   */
  proof: ProofConfig;

  /**
   * Fleek configuration to upload to IPFS
   */
  fleek: FleekConfig;

  ipfsGateway: string;

  /**
   * Only used for development mode, should be rinkeby provider on development
   */
  zNSProvider?: ethers.providers.Provider;
}

export const developmentConfiguration = ({
  ethereumProvider,
  polygonProvider,
  proof,
  fleek,
  ipfsGateway,
  zNSProvider,
}: ConfigParams): PolygonConfig => ({
  ethereum: ethereumZDAOConfig[SupportedChainId.GOERLI],
  ethereumProvider,
  polygon: polygonZDAOConfig[SupportedChainId.MUMBAI],
  polygonProvider,
  zNA: {
    zDAORegistry: zDAORegistryAddress[SupportedChainId.GOERLI],
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/deep-quality-dev/zdao-registry-goerli',
    zNSHub: zNSHubAddress[SupportedChainId.GOERLI],
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.goerli.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
    zDAOModule: zDAOModuleAddress[SupportedChainId.GOERLI],
    zDAOModuleSubgraphUri: zDAOModuleSubgraphUri[SupportedChainId.GOERLI],
  },
  proof,
  fleek,
  ipfsGateway,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  zNS: configuration.rinkebyConfiguration(zNSProvider!),
  isProd: false,
});

export const productionConfiguration = ({
  ethereumProvider,
  polygonProvider,
  proof,
  fleek,
  ipfsGateway,
}: ConfigParams): PolygonConfig => ({
  ethereum: ethereumZDAOConfig[SupportedChainId.MAINNET],
  ethereumProvider,
  polygon: polygonZDAOConfig[SupportedChainId.POLYGON],
  polygonProvider,
  zNA: {
    zDAORegistry: zDAORegistryAddress[SupportedChainId.MAINNET],
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry',
    zNSHub: zNSHubAddress[SupportedChainId.MAINNET],
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
    zDAOModule: zDAOModuleAddress[SupportedChainId.MAINNET],
    zDAOModuleSubgraphUri: zDAOModuleSubgraphUri[SupportedChainId.MAINNET],
  },
  proof,
  fleek,
  ipfsGateway,
  zNS: configuration.mainnetConfiguration(ethereumProvider),
  isProd: true,
});
