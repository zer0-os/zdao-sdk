import { SupportedChainId } from './enums';
import { Choice, zNA } from './primitives';
import { TokenMetaData } from './structures';

export interface CreateZDAOParams {
  // zNA, automatically linked with only one zNA
  zNA: zNA;

  // zDAO name
  name: string;

  // network id where zDAO was created
  network: SupportedChainId;

  // Gnosis safe address where collected treasuries are stored
  gnosisSafe: string;

  // Voting token (ERC20 or ERC721) on Ethereum, only token holders
  // can create a proposal
  token: string;

  // The minimum number of tokens required to become proposal creator
  amount: string;

  // Time duration of this proposal in seconds
  duration: number;

  // Delay of proposal to start voting in seconds, 0 by default
  votingDelay?: number;
}

export interface CreateProposalParams {
  // Title of the proposal
  title: string;

  // Content of the proposal
  body: string;

  // Array of choices
  choices: string[];

  // Token meta data to be transfered if this proposal has been succeeded
  transfer?: TokenMetaData;
}

export interface VoteProposalParams {
  // Yes or No
  choice: Choice;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CalculateProposalParams {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FinalizeProposalParams {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExecuteProposalParams {}

export interface PaginationParam {
  // From number, starting at 1
  from: number;

  // Number of items to be fetched
  count: number;
}
