import { ethers } from 'ethers';

import { Config } from '../types';

export enum SupportedChainId {
  ETHEREUM = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
}

export const developmentConfiguration = (
  contract: string,
  provider: ethers.providers.Provider
): Config => ({
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    ipfsGateway: 'cloudflare-ipfs.com',
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.rinkeby.gnosis.io',
    gateway: 'https://safe-client.staging.gnosisdev.com',
  },
  zNA: {
    contract,
    provider,
  },
});

export const productionConfiguration = (
  contract: string,
  provider: ethers.providers.Provider
): Config => ({
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    ipfsGateway: 'cloudflare-ipfs.com',
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
  },
  zNA: {
    contract,
    provider,
  },
});
