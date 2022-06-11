import { Config as zNSConfig } from '@zero-tech/zns-sdk';

import { SupportedChainId } from './enums';

export interface DAOConfig {
  // address to zDAOChef contract
  zDAOChef: string;

  // Contract Creation block number
  blockNumber: number;

  // RPC url for Web3 provider
  rpcUrl: string;

  // ChainId
  network: SupportedChainId;
}

export interface zNAConfig {
  // address to zDAORegistry contract
  zDAORegistry: string;

  // RPC url for Web3 provider
  rpcUrl: string;

  // ChainId
  network: SupportedChainId;
}

export interface GnosisSafeConfig {
  // uri to Gnosis Safe service
  serviceUri: string;

  // uri to Gnosis Safe gateway
  gateway: string;
}

export interface FleekConfig {
  // API Key to Fleek
  apiKey: string;

  // API Secret to Fleek
  apiSecret: string;
}

export interface BaseConfig {
  // zDAOChef contract configuration
  ethereum: DAOConfig;

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
