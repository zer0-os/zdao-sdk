export enum VoteChoice {
  Yes = 'Yes',
  No = 'No',
}

export interface TokenMetaData {
  recipient: string; // asset recipient address
  token: string; // asset token address
  decimals: number;
  symbol: string;
  amount: string; // BigNumber string mutiplied by decimals
}

export interface Proposal {
  id: string; // proposal id
  type: string; // only used for snapshot, @todo
  author: string;
  title: string;
  body?: string; // empty body if not defined
  ipfs: string; // uri to ipfs which contains proposal information and signature
  choices: VoteChoice[];
  created: Date;
  start: Date;
  end: Date;
  state: 'pending' | 'active' | 'closed';
  network: string;
  snapshot: string;
}

// @feedback: example:
export interface ProposalMetadata extends TokenMetaData {
  sender: string;
  abi: string;
}

export interface ProposalDetail extends Proposal {
  // undefined if no one votes
  scores?: number[];
  // metadata includes meta information for sending tokens to user.
  // undefined if there is no token transfer in the propossal.
  metadata?: ProposalMetadata;
}

export interface ProposalResult {
  resultsByVoteBalance: number[];
  sumOfResultsBalance: number;
}

export interface Vote {
  voter: string;
  choice: number[]; // VoteChoice;
  power: number; // voting power
}
