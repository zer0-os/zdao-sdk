import { gql } from 'graphql-request';

import { ENS, zDAOId, zNA } from '../types';

export interface ZDAORecord {
  id: zDAOId;
  ens: ENS;
  gnosisSafe: string;
  zNAs: zNA[];
}

export const ZDAORECORDS_QUERY = gql`
  query zDAORecords {
    zdaorecords {
      destroyed
      ensSpace
      gnosisSafe
      id
      zNAs {
        id
      }
    }
  }
`;

export const ZDAORECORDS_BY_QUERY = gql`
  query zDAORecords($id_in: [String]) {
    zdaorecords(where: { id_in: $id_in }) {
      destroyed
      ensSpace
      gnosisSafe
      id
      zNAs {
        id
      }
    }
  }
`;

export const ZNAS_QUERY = gql`
  query zNAAssociation {
    znaassociations {
      id
    }
  }
`;

export const ZNAASSOCIATION_BY_QUERY = gql`
  query zNAAssociation($id_in: [String]) {
    znaassociations(where: { id_in: $id_in }) {
      id
      zDAORecord {
        id
        gnosisSafe
        ensSpace
        destroyed
      }
    }
  }
`;
