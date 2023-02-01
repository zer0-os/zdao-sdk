import { Provider } from '@ethersproject/providers';
import { Config as zNSConfig } from '@zero-tech/zns-sdk';

export interface SnapshotConfig {
  // uri to Snaphost Hub
  serviceUri: string;
  // ipfs gateway without schemes
  ipfsGateway: string;
  // chain id as string where space created
  network: string;
}

export interface zNAConfig {
  // address to zDAORegistry contract
  zDAORegistry: string;

  // subgraphUri where indexed zDAORegistry, refer: config/index.ts
  subgraphUri: string;

  // address to zNSHub contract
  zNSHub: string;
}

export interface Config {
  snapshot: SnapshotConfig;
  zNA: zNAConfig;
  zNS: zNSConfig;
  provider: Provider; // web3 provider
}
