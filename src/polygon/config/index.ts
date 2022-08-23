import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import {
  zDAOModuleAddress,
  zDAOModuleSubgraphUri,
  zDAORegistryAddress,
  zDAORegistrySubgraphUri,
  zNSHubAddress,
} from '../../config';
import { EthereumDAOConfig, FleekConfig, SupportedChainId } from '../../types';
import { PolygonConfig, PolygonDAOConfig, ProofConfig } from '../types';

export const ethereumZDAOConfig: { [chainId: number]: EthereumDAOConfig } = {
  [SupportedChainId.MAINNET]: {
    zDAOChef: '0x7701913b65C9bCDa4d353F77EC12123d57D77f1e', // todo
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry',
  },
  [SupportedChainId.GOERLI]: {
    zDAOChef: '0xc9DC42076E5323Ae6c2f438302c70E08FaF0cae8', // todo
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/deep-quality-dev/zdao-registry-goerli',
  },
};

const polygonZDAOConfig: { [chainId: number]: PolygonDAOConfig } = {
  [SupportedChainId.MUMBAI]: {
    zDAOChef: '0x23E8f1D5BcB960221E405aD53231f932Cdb96f66', // todo
    blockNumber: 27589971, // todo
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/deep-quality-dev/zdao-registry-mumbai',
    staking: '0xaB00FB1Ce6E3c9Ea0A9BB5c1124430bBaF98Dac6',
    childChainManager: '0xb5505a6d998549090530911180f38aC5130101c6',
  },
  [SupportedChainId.POLYGON]: {
    zDAOChef: '', // todo
    blockNumber: 0, // todo
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry-polygon',
    staking: '',
    childChainManager: '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
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
    subgraphUri: zDAORegistrySubgraphUri[SupportedChainId.GOERLI],
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
    subgraphUri: zDAORegistrySubgraphUri[SupportedChainId.MAINNET],
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
