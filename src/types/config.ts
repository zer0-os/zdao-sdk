import { Config as zNSConfig } from '@zero-tech/zns-sdk';

import { SupportedChainId } from './enumerations';

export interface GnosisSafeConfig {
  // uri to Gnosis Safe service
  serviceUri: string;

  // uri to Gnosis Safe gateway
  gateway: string;
}

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

export interface ProofConfig {
  // From address
  from: string;
}

export interface FleekConfig {
  // API Key to Fleek
  apiKey: string;

  // API Secret to Fleek
  apiSecret: string;
}

export interface Config {
  // Gnosis Safe configuration
  gnosisSafe: GnosisSafeConfig;

  // Ethereum DAO configuration
  ethereum: DAOConfig;

  // Polygon DAO configuration
  polygon: DAOConfig;

  // Proof configuration
  proof: ProofConfig;

  // Fleek configuration to upload to IPFS
  fleek: FleekConfig;

  // zNS configuration, can be different network from Ethereum DAO configuration
  zNS: zNSConfig;

  // True for production mode, false for development mode
  isProd: boolean;
}
