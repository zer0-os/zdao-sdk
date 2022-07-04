import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import {
  DAOConfig,
  FleekConfig,
  SupportedChainId,
  zNAConfig,
} from '../../types';
import { SnapshotConfig } from '../types';

export interface ConfigParams {
  /**
   * On the development, ethereum network should be Goerli,
   * On the production, ethereum network should be mainnet
   */
  ethereum: DAOConfig;

  zNA: zNAConfig;

  /**
   * Fleek configuration to upload to IPFS
   */
  fleek: FleekConfig;

  ipfsGateway: string;
}

export const developmentConfiguration = ({
  ethereum,
  zNA,
  fleek,
  ipfsGateway,
}: ConfigParams): SnapshotConfig => ({
  ethereum,
  zNA,
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.rinkeby.gnosis.io',
    gateway: 'https://safe-client.staging.gnosisdev.com',
  },
  fleek,
  ipfsGateway,
  zNS: configuration.rinkebyConfiguration(
    new ethers.providers.JsonRpcProvider(ethereum.rpcUrl, ethereum.network)
  ),
  isProd: false,
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    network: SupportedChainId.RINKEBY.toString(),
  },
});

export const productionConfiguration = ({
  ethereum,
  zNA,
  fleek,
  ipfsGateway,
}: ConfigParams): SnapshotConfig => ({
  ethereum,
  zNA,
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
  },
  fleek,
  ipfsGateway,
  zNS: configuration.mainnetConfiguration(
    new ethers.providers.JsonRpcProvider(ethereum.rpcUrl, ethereum.network)
  ),
  isProd: true,
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    network: SupportedChainId.MAINNET.toString(),
  },
});
