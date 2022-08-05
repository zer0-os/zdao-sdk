import { Config as zNSConfig } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

export interface SnapshotConfig {
  // uri to Snaphost Hub
  serviceUri: string;
  // ipfs gateway without schemes
  ipfsGateway: string;
  // chain id as string where space created
  network: string;
}

export interface GnosisSafeConfig {
  // uri to Gnosis Safe service
  serviceUri: string;
  // uri to Gnosis Safe gateway
  gateway: string;
  // ipfs gateway without schemes
  ipfsGateway: string;
  // address to zDAOModule
  zDAOModule: string;
  // Subgraph Uri of ZDAOModule
  zDAOModuleSubgraphUri: string;
}

export interface zNAConfig {
  // subgraphUri where indexed zDAORegistry, refer: config/index.ts
  subgraphUri: string;
}

export interface Config {
  snapshot: SnapshotConfig;
  gnosisSafe: GnosisSafeConfig;
  zNA: zNAConfig;
  provider: ethers.providers.Provider; // web3 provider
  zNS: zNSConfig;
}
