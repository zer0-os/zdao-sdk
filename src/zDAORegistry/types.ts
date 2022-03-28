import { ENS, zDAOId, zNA } from '../types';

export interface ZDAORecord {
  id: zDAOId;
  ens: ENS;
  gnosisSafe: string;
  zNAs: zNA[];
}
