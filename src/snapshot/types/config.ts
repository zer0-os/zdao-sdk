import { ethers } from 'ethers';

import { BaseConfig } from '../../types';

export interface SnapshotConfig {
  // uri to Snaphost Hub
  serviceUri: string;

  // ipfs gateway without schemes
  ipfsGateway: string;

  // chain id as string where space created
  network: string;
}

export interface zNAConfig {
  // address to zDAOCore contract
  contract: string;

  // web3 provider
  provider: ethers.providers.Provider;
}

export interface Config extends BaseConfig {
  snapshot: SnapshotConfig;

  zNA: zNAConfig;
}
