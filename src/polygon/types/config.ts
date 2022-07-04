import { Config, DAOConfig } from '../../types';

export interface ProofConfig {
  // From address
  from: string;
}

export interface PolygonConfig extends Config {
  // Polygon DAO configuration
  polygon: DAOConfig;

  // Proof configuration
  proof: ProofConfig;
}
