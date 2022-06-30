import {
  CalculateProposalParams as CalculateProposalBaseParams,
  CreateProposalParams as CreateProposalBaseParams,
  CreateZDAOParams as CreateZDAOBaseParams,
  ExecuteProposalParams as ExecuteProposalBaseParams,
  FinalizeProposalParams as FinalizeProposalBaseParams,
  VoteProposalParams as VoteProposalBaseParams,
} from '../../types';

export interface CreateZDAOParams extends CreateZDAOBaseParams {
  // Threshold in 100% as 10000 required to check if proposal is succeeded
  votingThreshold: number;

  // True if relative majority to calculate voting result
  isRelativeMajority: boolean;

  // The number of voters in support of a proposal required in order
  // for a vote to succeed
  minimumVotingParticipants: number;

  // The number of votes in support of a proposal required in order
  // for a vote to succeed
  minimumTotalVotingTokens: string;
}

export type CreateProposalParams = CreateProposalBaseParams;

export type VoteProposalParams = VoteProposalBaseParams;

export type CalculateProposalParams = CalculateProposalBaseParams;

export interface FinalizeProposalParams extends FinalizeProposalBaseParams {
  txHash: string;
}

export type ExecuteProposalParams = ExecuteProposalBaseParams;
