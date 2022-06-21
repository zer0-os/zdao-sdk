import { zDAOId } from '../../types';

export interface PolygonZDAOProperties {
  // Unique id for looking up zDAO
  id: zDAOId;

  // Snapshot block number on which zDAO has been created
  snapshot: number;

  // Flag marking whether the zDAO has been destroyed
  destroyed: boolean;

  // Address to ZDAO contract
  address: string;
}
