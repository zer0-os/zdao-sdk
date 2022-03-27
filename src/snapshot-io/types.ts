export interface ERC20BalanceOfParams {
  spaceId: string;
  network: string;
  snapshot: number;
  token: string;
  decimals: number;
  symbol: string;
  voter: string;
}

export interface CreateProposalParams {
  spaceId: string;
  title: string;
  body: string;
  choices: string[];
  duration: number;
  snapshot: number;
  network: string;
  abi: string;
  sender: string;
  recipient: string;
  token: string;
  decimals: number;
  symbol: string;
  amount: string;
}

export interface VoteProposalParams {
  spaceId: string;
  proposalId: string;
  choice: number;
}

export interface SnapshotProposal {
  id: string; // proposal id
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
  network: string; // chain id
  snapshot: string; // snapshot block number
  scores: number[]; // scores per all the choices
  votes: number; // number of voters
}

export interface SnapshotProposalResponse {
  id: string;
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
