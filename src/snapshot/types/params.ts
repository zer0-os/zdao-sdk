import {
  CalculateProposalParams,
  CreateProposalParams,
  CreateZDAOParams,
  ExecuteProposalParams,
  FinalizeProposalParams,
  VoteProposalParams,
} from '../../types';
import { ENS } from './primitives';

export interface CreateSnapshotZDAOParams extends CreateZDAOParams {
  ens: ENS;
}

export interface CreateSnapshotProposalParams extends CreateProposalParams {
  // Array of choices
  choices: string[];

  // Block number
  snapshot: number;

  // Time duration of this proposal in seconds
  duration?: number;
}

export type VoteSnapshotProposalParams = VoteProposalParams;

export type CalculateSnapshotProposalParams = CalculateProposalParams;

export type FinalizeSnapshotProposalParams = FinalizeProposalParams;

export type ExecuteSnapshotProposalParams = ExecuteProposalParams;
