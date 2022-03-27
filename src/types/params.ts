import { SupportedChainId } from './enumerations';
import { Choice, zNA } from './primitives';
import { TokenMetaData } from './structures';

export interface CreateZDAOParams {
  // zNA
  zNA: zNA;
  // zDAO title
  title: string;
  // address to zDAO creator
  creator: string;
  // uri to avatar, if not defined, will use default avatar image in frontend
  avatar?: string;
  // network id where zDAO was created
  network: SupportedChainId;
  // adress to Gnosis Safe
  safeAddress: string;
  // addresses to Gnosis Safe owners
  owners: string[];
  // ERC20 token address to cast a vote
  votingToken: string;
}

export interface CreateProposalParams {
  title: string;
  body: string;
  duration: number; // time duration from start to end in seconds
  snapshot: number; // block number
  transfer: TokenMetaData;
}

export interface VoteProposalParams {
  proposal: string; // proposal id
  choice: Choice; // Yes or No
}

export interface ExecuteProposalParams {
  proposal: string; // proposal id
}
