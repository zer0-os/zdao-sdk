import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import { zDAOModuleAddress, zDAOModuleSubgraphUri } from '../../config';
import {
  EthereumDAOConfig,
  FleekConfig,
  SupportedChainId,
  zNAConfig,
} from '../../types';
import { PolygonConfig, PolygonDAOConfig, ProofConfig } from '../types';

export interface ConfigParams {
  /**
   * On the development, ethereum network should be Goerli,
   * On the production, ethereum network should be mainnet
   */
  ethereum: EthereumDAOConfig;

  ethereumProvider: ethers.providers.Provider;

  /**
   * On the development, polygon network should be mumbai
   * On the production, polygon network should be polygon
   */
  polygon: PolygonDAOConfig;

  polygonProvider: ethers.providers.Provider;

  zNA: zNAConfig;

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
  ethereum,
  ethereumProvider,
  polygon,
  polygonProvider,
  zNA,
  proof,
  fleek,
  ipfsGateway,
  zNSProvider,
}: ConfigParams): PolygonConfig => ({
  ethereum,
  ethereumProvider,
  polygon,
  polygonProvider,
  zNA,
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
  ethereum,
  ethereumProvider,
  polygon,
  polygonProvider,
  zNA,
  proof,
  fleek,
  ipfsGateway,
}: ConfigParams): PolygonConfig => ({
  ethereum,
  ethereumProvider,
  polygon,
  polygonProvider,
  zNA,
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
