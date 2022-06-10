import {
  CreateProposalParamsOptions as CreatePolygonProposalParamsOptions,
  CreateZDAOParamsOptions as CreatePolygonZDAOParamsOptions,
} from '../polygon';
import {
  CreateProposalParamsOptions as CreateSnapshotProposalParamsOptions,
  CreateZDAOParamsOptions as CreateSnapshotZDAOParamsOptions,
} from '../snapshot';
import { SupportedChainId } from './enums';
import { Choice, ProposalId, zNA } from './primitives';
import { TokenMetaData } from './structures';

export interface CreateZDAOParams {
  // zNA, automatically linked with only one zNA
  zNA: zNA;

  // zDAO title
  title: string;

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

  // Additional parameters for Snapshot/Polygon platform
  options?: CreatePolygonZDAOParamsOptions | CreateSnapshotZDAOParamsOptions;
}

export interface CreateProposalParams {
  // Title of the proposal
  title: string;

  // Content of the proposal
  body: string;

  // Token meta data to be transfered if this proposal has been succeeded
  transfer?: TokenMetaData;

  options?:
    | CreatePolygonProposalParamsOptions
    | CreateSnapshotProposalParamsOptions;
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

export interface TokenMintOptions {
  // Target address to mint for
  target: string;

  // Mint amount (as big number)
  amount: string;
}

export interface PaginationParam {
  // From number, starting at 1
  from: number;

  // Number of items to be fetched
  count: number;
}
