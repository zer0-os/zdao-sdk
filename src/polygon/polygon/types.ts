import { zDAOId } from '../../types';

export interface PolygonZDAOProperties {
  // Unique id for looking up zDAO
  id: zDAOId;

  // Time duration of proposal in seconds
  duration: number;

  // Address to voting token
  token: string;

  // Snapshot block number on which zDAO has been created
  snapshot: number;

  // Flag marking whether the zDAO has been destroyed
  destroyed: boolean;
}
