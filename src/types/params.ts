import { SupportedChainId } from './enumerations';
import { Choice, ProposalId, zNA } from './primitives';
import { TokenMetaData } from './structures';

export interface CreateZDAOParams {
  // zNA, automatically linked with only one zNA
  zNA: zNA;

  // zDAO title
  title: string;

  // Address who created zDAO, is the first zDAO owner
  createdBy: string;

  // network id where zDAO was created
  // This network can be not Goerli or Mainnet
  network: SupportedChainId;

  // Gnosis safe address where collected treasuries are stored
  gnosisSafe: string;

  // Voting token (ERC20 or ERC721) on Ethereum, only token holders
  // can create a proposal
  token: string;

  // The minimum number of tokens required to become proposal creator
  amount: string;

  // True if relative majority to calculate voting result
  isRelativeMajority: boolean;

  // The number of votes in support of a proposal required in order
  // for a vote to succeed
  quorumVotes: string;
}

export interface CreateProposalParams {
  // Title of the proposal
  title: string;

  // Content of the proposal
  body: string;

  // Time duration from start to end in seconds
  duration: number;

  // Token meta data to be transfered if this proposal has been succeeded
  transfer: TokenMetaData;
}

export interface VoteProposalParams {
  // Unique id for looking up proposal
  proposal: ProposalId;

  // Yes or No
  choice: Choice;
}

export interface ExecuteProposalParams {
  // Unique id for looking up proposal
  proposal: ProposalId;
}
