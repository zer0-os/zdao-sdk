import { Config as zNSConfig } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

export interface EthereumDAOConfig {
  // address to zDAOChef contract
  zDAOChef: string;
}

export interface zNAConfig {
  // address to zDAORegistry contract
  zDAORegistry: string;

  // subgraphUri where indexed zDAORegistry
  subgraphUri: string;

  // address to zNSHub contract
  zNSHub: string;
}

export interface GnosisSafeConfig {
  // uri to Gnosis Safe service
  serviceUri: string;

  // uri to Gnosis Safe gateway
  gateway: string;

  // address to zDAOModule
  zDAOModule: string;

  // Subgraph Uri of ZDAOModule
  zDAOModuleSubgraphUri: string;
}

export interface FleekConfig {
  // API Key to Fleek
  apiKey: string;

  // API Secret to Fleek
  apiSecret: string;
}

export interface Config {
  // zDAOChef contract configuration
  ethereum: EthereumDAOConfig;

  ethereumProvider: ethers.providers.Provider;

  // zDAORegistry contract configuration
  zNA: zNAConfig;

  // Gnosis Safe configuration
  gnosisSafe: GnosisSafeConfig;

  // fleek configuration to upload to IPFS
  fleek: FleekConfig;

  // ipfs gateway without schemes
  ipfsGateway: string;

  // zNS configuration, can be different network from Ethereum DAO configuration
  zNS: zNSConfig;

  // True for production mode, false for development mode
  isProd: boolean;
}
