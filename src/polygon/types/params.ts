import {
  CalculateProposalParams,
  CreateProposalParams,
  CreateZDAOParams,
  ExecuteProposalParams,
  FinalizeProposalParams,
  VoteProposalParams,
} from '../../types';

export interface CreatePolygonZDAOParams extends CreateZDAOParams {
  // Threshold in 100% as 10000 required to check if proposal is succeeded
  votingThreshold: number;

  // True if relative majority to calculate voting result
  isRelativeMajority: boolean;

  // The number of voters in support of a proposal required in order
  // for a vote to succeed
  minimumVotingParticipants: number;

  // The number of votes in support of a proposal required in order
  // for a vote to succeed in BigNumber
  minimumTotalVotingTokens: string;
}

export type CreatePolygonProposalParams = CreateProposalParams;

export type VotePolygonProposalParams = VoteProposalParams;

export type CalculatePolygonProposalParams = CalculateProposalParams;

export interface FinalizePolygonProposalParams extends FinalizeProposalParams {
  txHash: string;
}

export type ExecutePolygonProposalParams = ExecuteProposalParams;
