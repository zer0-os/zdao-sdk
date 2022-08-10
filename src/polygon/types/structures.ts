import { Token } from '../../types';

export interface StakingProperties {
  // Address to Staking contract
  address: string;
}

export interface zDAOOptions {
  polygonToken?: Token;
}
