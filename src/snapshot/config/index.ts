import { configuration } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

import {
  EthereumDAOConfig,
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
  ethereum: EthereumDAOConfig;

  zNA: zNAConfig;

  ethereumProvider: ethers.providers.Provider;

  /**
   * Fleek configuration to upload to IPFS
   */
  fleek: FleekConfig;

  ipfsGateway: string;
}

export const developmentConfiguration = ({
  ethereum,
  ethereumProvider,
  zNA,
  fleek,
  ipfsGateway,
}: ConfigParams): SnapshotConfig => ({
  ethereum,
  ethereumProvider,
  zNA,
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.rinkeby.gnosis.io',
    gateway: 'https://safe-client.staging.gnosisdev.com',
  },
  fleek,
  ipfsGateway,
  zNS: configuration.rinkebyConfiguration(ethereumProvider),
  isProd: false,
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    network: SupportedChainId.RINKEBY.toString(),
  },
});

export const productionConfiguration = ({
  ethereum,
  ethereumProvider,
  zNA,
  fleek,
  ipfsGateway,
}: ConfigParams): SnapshotConfig => ({
  ethereum,
  ethereumProvider,
  zNA,
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
  },
  fleek,
  ipfsGateway,
  zNS: configuration.mainnetConfiguration(ethereumProvider),
  isProd: true,
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    network: SupportedChainId.MAINNET.toString(),
  },
});
