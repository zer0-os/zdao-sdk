import { gql } from 'graphql-request';

import { zDAOId } from '../../types';
import { ENSId } from '../types';

export interface SnapshotZDAOProperties {
  id: zDAOId;
  snapshot: number;
  ensSpace: ENSId;
  gnosisSafe: string;
  destroyed: boolean;
}

export const ETHEREUMZDAOS_BY_QUERY = gql`
  query SnapshotZDAOs($zDAOId: String!) {
    snapshotZDAOs(where: { id: $zDAOId }) {
      createdBy
      destroyed
      ensSpace
      gnosisSafe
      id
      zDAOId
      zDAORecord {
        id
        destroyed
        createdBy
        gnosisSafe
        name
        platformType
        zDAOId
      }
    }
  }
`;
