import { gql } from 'graphql-request';

export const EXECUTEDPROPOSALS_BY_QUERY = gql`
  query ExecutedProposals($id_in: [String]) {
    executedProposals(where: { id_in: $id_in }) {
      id
      platformType
      proposalId
    }
  }
`;

export const ZDAORECORDS_QUERY = gql`
  query zDAORecord($platformType: Int!) {
    zdaorecords(where: { destroyed: false, platformType: $platformType }) {
      zDAOId
      platformType
      name
      id
      gnosisSafe
      destroyed
      createdBy
      zNAs {
        id
      }
    }
  }
`;

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
