import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import { DAOConfig, FleekConfig, zNAConfig } from '../../types';
import { PolygonConfig, ProofConfig } from '../types';

export interface ConfigParams {
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
  polygon,
  zNA,
  proof,
  fleek,
  ipfsGateway,
  zNSProvider,
}: ConfigParams): PolygonConfig => ({
  ethereum,
  polygon,
  zNA,
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.goerli.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
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
  polygon,
  zNA,
  proof,
  fleek,
  ipfsGateway,
}: ConfigParams): PolygonConfig => ({
  ethereum,
  polygon,
  zNA,
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
  },
  proof,
  fleek,
  ipfsGateway,
  zNS: configuration.mainnetConfiguration(
    new ethers.providers.JsonRpcProvider(ethereum.rpcUrl, ethereum.network)
  ),
  isProd: true,
});
