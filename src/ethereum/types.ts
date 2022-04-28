import { zDAOId, zDAOProperties, zNA } from '../types';

export interface ZDAORecord {
  id: zDAOId;
  zDAO: string;
  zNAs: zNA[];
}

export interface EtherZDAOProperties extends zDAOProperties {
  // Address to ZDAO contract
  address: string;

  // Snapshot block number on which zDAO has been created
  snapshot: number;
}
