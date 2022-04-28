import { zDAOProperties } from '../types';

export interface PolyZDAOProperties
  extends Omit<
    zDAOProperties,
    'zNAs' | 'title' | 'createdBy' | 'gnosisSafe' | 'token' | 'amount'
  > {
  // Address to ZDAO contract
  address: string;
}
