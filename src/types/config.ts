import { Config as zNSConfig } from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';

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

  // web3 provider
  provider: ethers.providers.Provider;
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
}
