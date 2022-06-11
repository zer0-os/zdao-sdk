import { BaseConfig, DAOConfig, FleekConfig } from '../../types';

export interface ProofConfig {
  // From address
  from: string;
}

export interface Config extends BaseConfig {
  // Polygon DAO configuration
  polygon: DAOConfig;

  // Proof configuration
  proof: ProofConfig;

  // Fleek configuration to upload to IPFS
  fleek: FleekConfig;
}
