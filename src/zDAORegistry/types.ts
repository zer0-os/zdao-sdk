import { gql } from 'graphql-request';

import { ENS, zDAOId, zNA } from '../types';

export interface ZDAORecord {
  id: zDAOId;
  ens: ENS;
  safeGlobal: string;
  zNAs: zNA[];
}

export const ZNAS_QUERY = gql`
  query zNAAssociation($platformType: Int!) {
    znaassociations(
      where: { zDAORecord_: { destroyed: false, platformType: $platformType } }
    ) {
      id
    }
  }
`;

export const ZNAASSOCIATION_BY_QUERY = gql`
  query zNAAssociation($id_in: [String!], $platformType: Int!) {
    znaassociations(
      where: {
        zDAORecord_: { destroyed: false, platformType: $platformType }
        id_in: $id_in
      }
    ) {
      id
      zDAORecord {
        id
        zDAOId
        createdBy
        destroyed
        gnosisSafe
        name
        platformType
        zNAs {
          id
        }
      }
    }
  }
`;
