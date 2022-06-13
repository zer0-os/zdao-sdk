import { zDAOId, zDAOProperties, zNA } from '../../types';

export interface ZDAORecord {
  id: zDAOId;
  zDAO: string;
  zNAs: zNA[];
}

export interface RootZDAOProperties extends Omit<zDAOProperties, 'state'> {
  // Address to ZDAO contract
  address: string;
}
