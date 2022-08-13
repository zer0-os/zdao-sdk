import { gql } from 'graphql-request';

export const EXECUTEDPROPOSALS_QUERY = gql`
  query ExecutedProposals {
    executedProposals {
      id
      platformType
      proposalHash
    }
  }
`;

export const EXECUTEDPROPOSALS_BY_QUERY = gql`
  query ExecutedProposals($id_in: [String]) {
    executedProposals(where: { id_in: $id_in }) {
      id
      platformType
      proposalHash
    }
  }
`;
