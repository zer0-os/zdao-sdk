import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import { Config, SupportedChainId } from '../types';

type AddressMap = { [chainId: number]: string };
export const MultiCallAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [SupportedChainId.ROPSTEN]: '0x53c43764255c17bd724f74c4ef150724ac50a3ed',
  [SupportedChainId.RINKEBY]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
};

export const developmentConfiguration = (
  contract: string,
  provider: ethers.providers.Provider,
  ipfsGateway = 'cloudflare-ipfs.com'
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
    contract,
    provider,
  },
  zNS: configuration.rinkebyConfiguration(provider),
});

export const productionConfiguration = (
  contract: string,
  provider: ethers.providers.Provider,
  ipfsGateway = 'cloudflare-ipfs.com'
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
    contract,
    provider,
  },
  zNS: configuration.mainnetConfiguration(provider),
});
