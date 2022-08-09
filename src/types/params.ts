import { SupportedChainId } from './enumerations';
import { Choice, ENS, zNA } from './primitives';
import { TokenMetaData } from './structures';

export interface CreateZDAOParams {
  // ENS
  ens: ENS;
  // zNA, automatically linked with only one zNA
  zNA: zNA;
  // zDAO title
  title: string;
  // address to zDAO creator
  creator: string;
  // network id where zDAO was created
  network: SupportedChainId;
  // proposal duration if DAO has fixed proposal
  duration?: number;
  // adress to Gnosis Safe
  safeAddress: string;
  // ERC20 token address to cast a vote
  votingToken: string;
}

export interface CreateProposalParams {
  title: string;
  body: string;
  choices?: string[];
  duration?: number; // time duration from start to end in seconds
  snapshot: number; // block number
  transfer?: TokenMetaData; // undefined if not a funding proposal
}

export interface VoteProposalParams {
  proposal: string; // proposal id
  choice: Choice; // Yes or No
}

export interface ExecuteProposalParams {
  proposal: string; // proposal id
}

export interface PaginationParam {
  from: number;
  count: number;
}
