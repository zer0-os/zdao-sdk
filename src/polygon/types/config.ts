import { ethers } from 'ethers';

import { Config } from '../../types';

export interface PolygonDAOConfig {
  // address to zDAOChef contract
  zDAOChef: string;

  // Contract Creation block number
  blockNumber: number;

  // subgraphUri to zDAOChef
  subgraphUri: string;

  // address to Staking contract
  staking: string;

  // address to IChildChainManager contract
  childChainManager: string;
}

export interface ProofConfig {
  // From address
  from: string;
}

export interface PolygonConfig extends Config {
  // Polygon DAO configuration
  polygon: PolygonDAOConfig;

  polygonProvider: ethers.providers.Provider;

  // Proof configuration
  proof: ProofConfig;
}
