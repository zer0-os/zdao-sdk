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
  // @feedback: avoid `?` in objects where the user might use it
  // @feedback: and if you can't avoid it, explain why it might not be available / in what circumstances
  body?: string;
  // @example: This is only available if the proposal was properly created?
  ipfs?: string;
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
  scores?: number[];
  // strategies?: any; // only used for snapshot, @todo
  // @feedback: Just create an interface that extends
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
