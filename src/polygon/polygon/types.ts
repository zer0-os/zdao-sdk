import { BigNumber } from 'ethers';
import { gql } from 'graphql-request';

import { ProposalId, zDAOId } from '../../types';

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

export interface PolygonSubgraphZDAO {
  zDAOId: zDAOId;
  token: string;
  duration: number;
  votingDelay: number;
  snapshot: number;
  destroyed: boolean;
}

export interface PolygonSubgraphProposal {
  zDAOId: zDAOId;
  proposalId: ProposalId;
  numberOfChoices: number;
  startTimestamp: number;
  endTimestamp: number;
  voters: number;
  snapshot: number;
  canceled: boolean;
  calculated: boolean;
  sumOfVotes: BigNumber[];
}

export const POLYGONZDAOS_BY_QUERY = gql`
  query PolygonZDAOs($zDAOId: Int!) {
    polygonZDAOs(where: { zDAOId: $zDAOId }) {
      destroyed
      duration
      id
      platformType
      token
      votingDelay
      zDAOId
      snapshot
    }
  }
`;

export const POLYGONPROPOSALS_BY_QUERY = gql`
  query PolygonProposals($zDAOId: Int!) {
    polygonProposals(where: { zDAO_: { zDAOId: $zDAOId } }) {
      calculated
      canceled
      endTimestamp
      id
      numberOfChoices
      platformType
      proposalId
      snapshot
      startTimestamp
      sumOfVotes
      voters
      zDAO {
        zDAOId
      }
    }
  }
`;

export const POLYGONPROPOSAL_BY_QUERY = gql`
  query PolygonProposal($zDAOId: Int!, $proposalId: String!) {
    polygonProposals(
      where: { zDAO_: { zDAOId: $zDAOId }, proposalId: $proposalId }
    ) {
      calculated
      canceled
      endTimestamp
      id
      numberOfChoices
      platformType
      proposalId
      snapshot
      startTimestamp
      sumOfVotes
      voters
      zDAO {
        zDAOId
      }
    }
  }
`;
