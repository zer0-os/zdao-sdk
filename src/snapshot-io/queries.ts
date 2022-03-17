import gql from 'graphql-tag';

export const SPACES_QUERY = gql`
  query Spaces($id_in: [String]) {
    spaces(where: { id_in: $id_in }) {
      id
      name
      about
      network
      symbol
      network
      terms
      skin
      avatar
      twitter
      github
      private
      domain
      members
      admins
      categories
      plugins
      followersCount
      voting {
        delay
        period
        type
        quorum
        hideAbstain
      }
      strategies {
        name
        params
      }
      validation {
        name
        params
      }
      filters {
        minScore
        onlyMembers
      }
    }
  }
`;

export const PROPOSALS_QUERY = gql`
  query Proposals($spaceId: String!, $skip: Int!) {
    proposals(
      first: 10
      skip: $skip
      where: { space_in: [$spaceId] }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      space {
        name
      }
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
      vp_by_strategy
    }
  }
`;
