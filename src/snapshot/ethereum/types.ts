import { zDAOId } from '../../types';
import { ENSId } from '../types';

export interface SnapshotZDAOProperties {
  id: zDAOId;
  snapshot: number;
  ensSpace: ENSId;
  gnosisSafe: string;
  destroyed: boolean;
}
