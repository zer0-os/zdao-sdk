import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import { Config, SupportedChainId } from '../types';

type AddressMap = { [chainId: number]: string };
export const MultiCallAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [SupportedChainId.ROPSTEN]: '0x53c43764255c17bd724f74c4ef150724ac50a3ed',
  [SupportedChainId.RINKEBY]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
};

export const zDAORegistryAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x7701913b65C9bCDa4d353F77EC12123d57D77f1e',
  [SupportedChainId.RINKEBY]: '0x73D44dEa3A3334aB2504443479aD531FfeD2d2D9',
};

export const zNSHubAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x6141d5cb3517215a03519a464bf9c39814df7479',
  [SupportedChainId.RINKEBY]: '0x7F918CbbBf37e4358ad5f060F15110151d14E59e',
};

export const DEFAULT_PROPOSAL_CHOICES = ['Approve', 'Deny'];

export const developmentConfiguration = (
  provider: ethers.providers.Provider,
  ipfsGateway = 'zer0.infura-ipfs.io'
): Config => ({
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    ipfsGateway,
    network: SupportedChainId.RINKEBY.toString(),
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.rinkeby.gnosis.io',
    gateway: 'https://safe-client.staging.gnosisdev.com',
    ipfsGateway,
  },
  zNA: {
    zDAORegistry: zDAORegistryAddress[SupportedChainId.RINKEBY],
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry-rinkeby',
    zNSHub: zNSHubAddress[SupportedChainId.RINKEBY],
  },
  provider,
  zNS: configuration.rinkebyConfiguration(provider),
});

export const productionConfiguration = (
  provider: ethers.providers.Provider,
  ipfsGateway = 'zer0.infura-ipfs.io'
): Config => ({
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    ipfsGateway,
    network: SupportedChainId.MAINNET.toString(),
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
    ipfsGateway,
  },
  zNA: {
    zDAORegistry: zDAORegistryAddress[SupportedChainId.MAINNET],
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry',
    zNSHub: zNSHubAddress[SupportedChainId.MAINNET],
  },
  provider,
  zNS: configuration.mainnetConfiguration(provider),
});
