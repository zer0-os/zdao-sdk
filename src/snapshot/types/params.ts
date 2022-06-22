import { ENS } from './primitives';

export interface CreateZDAOParamsOptions {
  ens: ENS;
}

export interface CreateProposalParamsOptions {
  // Array of choices
  choices: string[];

  // Block number
  // todo, check again
  snapshot: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FinalizeProposalParamsOptions {}
