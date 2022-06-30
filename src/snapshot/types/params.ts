import {
  CalculateProposalParams as CalculateProposalBaseParams,
  CreateProposalParams as CreateProposalBaseParams,
  CreateZDAOParams as CreateZDAOBaseParams,
  ExecuteProposalParams as ExecuteProposalBaseParams,
  FinalizeProposalParams as FinalizeProposalBaseParams,
  VoteProposalParams as VoteProposalBaseParams,
} from '../../types';
import { ENS } from './primitives';

export interface CreateZDAOParams extends CreateZDAOBaseParams {
  ens: ENS;
}

export interface CreateProposalParams extends CreateProposalBaseParams {
  // Array of choices
  choices: string[];

  // Block number
  snapshot: number;
}

export type VoteProposalParams = VoteProposalBaseParams;

export type CalculateProposalParams = CalculateProposalBaseParams;

export type FinalizeProposalParams = FinalizeProposalBaseParams;

export type ExecuteProposalParams = ExecuteProposalBaseParams;
