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
