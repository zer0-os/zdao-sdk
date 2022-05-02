import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import { Config, DAOConfig, FleekConfig, SupportedChainId } from '../types';

type AddressMap = { [chainId in SupportedChainId]: string };
export const MultiCallAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [SupportedChainId.RINKEBY]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  [SupportedChainId.GOERLI]: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
  [SupportedChainId.MUMBAI]: '0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc',
  [SupportedChainId.POLYGON]: '0xCBca837161be50EfA5925bB9Cc77406468e76751',
};

export const IPFSGatway = 'cloudflare-ipfs.com';

export const EIP712Domain = {
  // todo, should sync with package.json
  name: 'zDAO-sdk',
  version: '0.0.6',
};

interface ConfigParams {
  /**
   * On the development, ethereum network should be Goerli,
   * On the production, ethereum network should be mainnet
   */
  ethereum: DAOConfig;

  /**
   * On the development, polygon network should be mumbai
   * On the production, polygon network should be polygon
   */
  polygon: DAOConfig;

  // Fleek configuration to upload to IPFS
  fleek: FleekConfig;

  /**
   * Only used for development mode, should be rinkeby provider on development
   */
  zNSProvider?: ethers.providers.Provider;
}

export const developmentConfiguration = ({
  ethereum,
  polygon,
  fleek,
  zNSProvider,
}: ConfigParams): Config => ({
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.goerli.gnosis.io',
    gateway: 'https://safe-client.staging.gnosisdev.com',
  },
  ethereum,
  polygon,
  fleek,
  zNS: configuration.rinkebyConfiguration(zNSProvider!),
});

export const productionConfiguration = ({
  ethereum,
  polygon,
  fleek,
}: ConfigParams): Config => ({
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
  },
  ethereum,
  polygon,
  fleek,
  zNS: configuration.mainnetConfiguration(ethereum.provider),
});
