import { zDAOId, zNA } from '../../types';
import { ENS } from '../types';

export interface ZDAORecord {
  id: zDAOId;
  ens: ENS;
  gnosisSafe: string;
  zNAs: zNA[];
}
