import { ENS, ProposalId, Token, TokenMetaData } from '../types';

export interface SpaceParams {
  spaceId: ENS;
  network: string;
  strategies?: any;
}

export interface GetProposalParams extends SpaceParams {
  proposalId: string;
}

export interface ListVotesParams extends SpaceParams {
  proposalId: string;
  scores_state: 'final' | 'invalid' | 'pending';
  snapshot: number;
  from: number;
  count: number;
  voter: string;
}

export interface ERC20BalanceOfParams extends SpaceParams {
  snapshot: number;
  token: string;
  decimals: number;
  symbol: string;
  voter: string;
}

export interface VotingPowerParams extends SpaceParams {
  snapshot: number;
  voter: string;
}

export interface CreateProposalParams extends SpaceParams {
  title: string;
  body: string;
  choices: string[];
  duration: number;
  snapshot: number;
  token: Token; // voting token
  transfer?: TokenMetaData;
}

export interface VoteProposalParams {
  spaceId: ENS;
  proposalId: ProposalId;
  choice: number;
}

export interface SnapshotSpace {
  id: ENS; // space id(ens)
  name: string;
  avatar?: string;
  network: string;
  duration?: number;
  followers: number;
}

export interface SnapshotSpaceDetails extends SnapshotSpace {
  admins: string[];
  strategies: any[];
}

export interface SnapshotProposal {
  id: ProposalId; // proposal id
  type: string; // proposal type (e.g. single-choice)
  author: string; // proposal creator
  title: string; // proposal title
  body?: string; // empty body if not defined
  ipfs: string; // uri to ipfs which contains proposal information and signature
  choices: string[];
  created: Date;
  start: Date;
  end: Date;
  state: 'pending' | 'active' | 'closed';
  scores_state: 'final' | 'invalid' | 'pending';
  network: string; // chain id
  snapshot: number; // snapshot block number
  scores: number[]; // scores per all the choices
  votes: number; // number of voters
}

export interface SnapshotProposalResponse {
  id: ProposalId;
  ipfs: string;
}

export interface ProposalResult {
  resultsByVoteBalance: number[];
  sumOfResultsBalance: number;
}

export interface SnapshotVote {
  voter: string;
  choice: number[];
  power: number; // voting power
}
