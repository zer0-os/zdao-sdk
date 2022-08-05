import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import { Config, SupportedChainId } from '../types';

type AddressMap = { [chainId: number]: string };
export const MultiCallAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [SupportedChainId.ROPSTEN]: '0x53c43764255c17bd724f74c4ef150724ac50a3ed',
  [SupportedChainId.RINKEBY]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
};

export const DEFAULT_PROPOSAL_CHOICES = ['Approve', 'Deny'];

const zDAOModuleAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '',
  [SupportedChainId.ROPSTEN]: '',
  [SupportedChainId.RINKEBY]: '0x70F9A6e7f037389f3200EB8F635AF1b06b110dDF',
};

export const developmentConfiguration = (
  provider: ethers.providers.Provider,
  ipfsGateway = 'snapshot.mypinata.cloud'
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
    zDAOModule: zDAOModuleAddress[SupportedChainId.RINKEBY],
  },
  zNA: {
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry-rinkeby',
  },
  provider,
  zNS: configuration.rinkebyConfiguration(provider),
});

export const productionConfiguration = (
  provider: ethers.providers.Provider,
  ipfsGateway = 'snapshot.mypinata.cloud'
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
    zDAOModule: zDAOModuleAddress[SupportedChainId.RINKEBY],
  },
  zNA: {
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry',
  },
  provider,
  zNS: configuration.mainnetConfiguration(provider),
});
