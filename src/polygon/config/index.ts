import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import { FleekConfig } from '../../types';
import { Config, DAOConfig, ProofConfig } from '../types';

export const IPFSGatway = 'cloudflare-ipfs.com';

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

  /**
   * Proof configuration for @maticnetwork/maticjs
   */
  proof: ProofConfig;

  /**
   * Fleek configuration to upload to IPFS
   */
  fleek: FleekConfig;

  /**
   * Only used for development mode, should be rinkeby provider on development
   */
  zNSProvider?: ethers.providers.Provider;
}

// todo, should be able to configure ipfs gateways as configuration parameter

export const developmentConfiguration = ({
  ethereum,
  polygon,
  proof,
  fleek,
  zNSProvider,
}: ConfigParams): Config => ({
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.goerli.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
    ipfsGateway: IPFSGatway,
  },
  ethereum,
  polygon,
  proof,
  fleek,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  zNS: configuration.rinkebyConfiguration(zNSProvider!),
  isProd: false,
});

export const productionConfiguration = ({
  ethereum,
  polygon,
  proof,
  fleek,
}: ConfigParams): Config => ({
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
    ipfsGateway: IPFSGatway,
  },
  ethereum,
  polygon,
  proof,
  fleek,
  zNS: configuration.mainnetConfiguration(
    new ethers.providers.JsonRpcProvider(ethereum.rpcUrl, ethereum.network)
  ),
  isProd: true,
});
