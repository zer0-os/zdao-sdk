import { ethers } from 'ethers';
import { Config } from '../types';

export enum SupportedChainId {
  ETHEREUM = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
}

export const developmentConfiguration = (
  provider: ethers.providers.Web3Provider
): Config => ({
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    ipfsUri: 'cloudflare-ipfs.com',
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.rinkeby.gnosis.io',
    safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
    gateway: 'https://safe-client.staging.gnosisdev.com',
  },
  zNA: {
    contract: '',
    provider,
  },
  chainId: '4',
});

export const productionConfiguration = (
  provider: ethers.providers.Web3Provider
): Config => ({
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    ipfsUri: 'cloudflare-ipfs.com',
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
    gateway: 'https://safe-client.gnosis.io',
  },
  zNA: {
    contract: '',
    provider,
  },
  chainId: '1',
});
