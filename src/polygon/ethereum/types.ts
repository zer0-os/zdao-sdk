import { zDAOId, zDAOProperties, zNA } from '../../types';

export interface ZDAORecord {
  id: zDAOId;
  zDAO: string;
  zNAs: zNA[];
}

export type EthereumZDAOProperties = Omit<zDAOProperties, 'state'>;
