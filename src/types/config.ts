import { ethers } from 'ethers';

export interface SnapshotConfig {
  // uri to Snaphost Hub
  serviceUri: string;
  // ipfs gateway
  ipfsGateway: string;
}

export interface GnosisSafeConfig {
  // uri to Gnosis Safe service
  serviceUri: string;
  // uri to Gnosis Safe gateway
  gateway: string;
}

export interface zNAConfig {
  // address to zDAOCore contract
  contract: string;
  // web3 provider
  provider: ethers.providers.Provider;
}

export interface Config {
  snapshot: SnapshotConfig;
  gnosisSafe: GnosisSafeConfig;
  zNA: zNAConfig;
}
