import { BigNumber } from 'ethers';
import { gql } from 'graphql-request';

import { zDAOId, zDAOProperties } from '../../types';

export type EthereumZDAOProperties = Omit<zDAOProperties, 'state'>;

export interface EthereumSubgraphZDAO {
  zDAOId: zDAOId;
  name: string;
  createdBy: string;
  gnosisSafe: string;
  token: string;
  amount: BigNumber;
  duration: number;
  votingDelay: number;
  votingThreshold: number;
  minimumVotingParticipants: number;
  minimumTotalVotingTokens: BigNumber;
  isRelativeMajority: boolean;
  snapshot: number;
  destroyed: boolean;
}

export interface EthereumSubgraphProposal {
  proposalId: string;
  numberOfChoices: number;
  createdBy: string;
  snapshot: number;
  ipfs: string;
  created: number;
  canceled: boolean;
  calculated: boolean;
}

export const ETHEREUMZDAOS_BY_QUERY = gql`
  query EthereumZDAOs($zDAOId: String!) {
    ethereumZDAOs(where: { id: $zDAOId }) {
      votingThreshold
      votingDelay
      token
      minimumVotingParticipants
      minimumTotalVotingTokens
      id
      gnosisSafe
      duration
      destroyed
      amount
      createdBy
      snapshot
      isRelativeMajority
      zDAORecord {
        destroyed
        gnosisSafe
        createdBy
        id
        name
        platformType
        zDAOId
      }
    }
  }
`;

export const ETHEREUMPROPOSALS_BY_QUERY = gql`
  query EthereumProposals($zDAOId: String!) {
    ethereumProposals(where: { zDAO_: { id: $zDAOId } }) {
      calculated
      canceled
      createdBy
      id
      numberOfChoices
      snapshot
      ipfs
      created
      proposalId
    }
  }
`;

export const ETHEREUMPROPOSAL_BY_QUERY = gql`
  query EthereumProposal($proposalId: String!) {
    ethereumProposals(where: { id: $proposalId }) {
      calculated
      canceled
      createdBy
      id
      numberOfChoices
      snapshot
      ipfs
      created
      proposalId
    }
  }
`;
