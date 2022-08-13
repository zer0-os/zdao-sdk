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
  query ExecutedProposals($platformType: Int!, $proposalHashes: [String!]) {
    executedProposals(
      where: { platformType: $platformType, proposalHash_in: $proposalHashes }
    ) {
      id
      platformType
      proposalHash
    }
  }
`;
