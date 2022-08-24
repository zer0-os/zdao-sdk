import { ethers } from 'ethers';

import { Config } from '../../types';

export interface PolygonDAOConfig {
  /**
   * Address to zDAOChef contract
   */
  zDAOChef: string;

  /**
   * Contract Creation block number
   */
  blockNumber: number;

  /**
   * SubgraphUri to zDAOChef
   */
  subgraphUri: string;

  /**
   * Address to Staking contract
   */
  staking: string;

  /**
   * Address to IChildChainManager contract
   */
  childChainManager: string;
}

export interface ProofConfig {
  /**
   * From address
   */
  from: string;
}

export interface PolygonConfig extends Config {
  /**
   * Polygon DAO configuration
   */
  polygon: PolygonDAOConfig;

  polygonProvider: ethers.providers.Provider;

  /**
   * Proof configuration for @maticnetwork/maticjs
   */
  proof: ProofConfig;
}
