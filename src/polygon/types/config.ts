import { BaseConfig, FleekConfig, SupportedChainId } from '../../types';

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

export interface Config extends BaseConfig {
  // Ethereum DAO configuration
  ethereum: DAOConfig;

  // Polygon DAO configuration
  polygon: DAOConfig;

  // Proof configuration
  proof: ProofConfig;

  // Fleek configuration to upload to IPFS
  fleek: FleekConfig;
}
