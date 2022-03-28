import gql from 'graphql-tag';

export const SPACES_QUERY = gql`
  query Spaces($id_in: [String]) {
    spaces(where: { id_in: $id_in }) {
      id
      name
      about
      network
      symbol
      terms
      avatar
      private
      domain
      admins
      followersCount
      strategies {
        name
        params
      }
    }
  }
`;

export const PROPOSALS_QUERY = gql`
  query Proposals(
    $spaceId: String!
    $network: String!
    $skip: Int!
    $first: Int!
  ) {
    proposals(
      first: $first
      skip: $skip
      where: { space_in: [$spaceId], network: $network }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      type
      author
      title
      body
      ipfs
      choices
      created
      start
      end
      state
      network
      snapshot
      scores
      votes
    }
  }
`;

export const PROPOSAL_QUERY = gql`
  query Proposal($id: String!) {
    proposal(id: $id) {
      id
      ipfs
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      created
      plugins
      network
      type
      strategies {
        name
        params
      }
      space {
        id
        name
      }
      scores_state
      scores
      scores_by_strategy
      scores_total
      votes
    }
  }
`;

export const VOTES_QUERY = gql`
  query Votes(
    $id: String!
    $first: Int
    $skip: Int
    $orderBy: String
    $orderDirection: OrderDirection
    $voter: String
  ) {
    votes(
      first: $first
      skip: $skip
      where: { proposal: $id, vp_gt: 0, voter: $voter }
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      ipfs
      voter
      choice
      vp
    }
  }
`;
