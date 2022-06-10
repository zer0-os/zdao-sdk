import { Config as zNSConfig } from '@zero-tech/zns-sdk';

export interface GnosisSafeConfig {
  // uri to Gnosis Safe service
  serviceUri: string;

  // uri to Gnosis Safe gateway
  gateway: string;

  // ipfs gateway without schemes
  ipfsGateway: string;
}

export interface FleekConfig {
  // API Key to Fleek
  apiKey: string;

  // API Secret to Fleek
  apiSecret: string;
}

export interface BaseConfig {
  // Gnosis Safe configuration
  gnosisSafe: GnosisSafeConfig;

  // zNS configuration, can be different network from Ethereum DAO configuration
  zNS: zNSConfig;

  // True for production mode, false for development mode
  isProd: boolean;
}
