import { Token } from '../../types';

export interface StakingProperties {
  // Chain Id
  network: number;

  // Address to Staking contract
  address: string;
}

export interface zDAOOptions {
  polygonToken: Token;
}
