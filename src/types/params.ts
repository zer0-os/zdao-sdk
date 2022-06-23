import {
  CreateProposalParamsOptions as CreatePolygonProposalParamsOptions,
  CreateZDAOParamsOptions as CreatePolygonZDAOParamsOptions,
  FinalizeProposalParamsOptions as FinalizePolygonProposalParamsOptions,
} from '../polygon';
import {
  CreateProposalParamsOptions as CreateSnapshotProposalParamsOptions,
  CreateZDAOParamsOptions as CreateSnapshotZDAOParamsOptions,
  FinalizeProposalParamsOptions as FinalizeSnapshotProposalParamsOptions,
} from '../snapshot';
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

  // Additional parameters for Snapshot/Polygon platform
  options: CreatePolygonZDAOParamsOptions | CreateSnapshotZDAOParamsOptions;
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
  // Yes or No
  choice: Choice;
}

export interface CalculateProposalParams {
  options?: any;
}

export interface FinalizeProposalParams {
  options?:
    | FinalizePolygonProposalParamsOptions
    | FinalizeSnapshotProposalParamsOptions;
}

export interface ExecuteProposalParams {
  options?: any;
}

export interface PaginationParam {
  // From number, starting at 1
  from: number;

  // Number of items to be fetched
  count: number;
}
