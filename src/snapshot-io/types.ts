export enum VoteChoice {
  Yes = 'Yes',
  No = 'No',
}

export interface zDAO {
  id: string; // Global zDAO identifier
  zNA: string; // Linked zNA
  title?: string; // zDAO title
  creator: string; // Creator wallet address
  owner: string; // Owner wallet address
  avatar?: string; // Avatar uri (https link)
  network: string; // Chain id
  strategies?: any; // only used for snapshot, @todo
  safeAddress: string; // Gnosis Safe address
  votingToken: string; // Voting token address
}

export interface TokenMetaData {
  recipient: string; // asset recipient address
  token: string; // asset token address
  decimals: number;
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
  choices: string[]; // VoteChoice[];
  created: Date;
  start: Date;
  end: Date;
  state: 'pending' | 'active' | 'closed';
  network: string;
  snapshot: string;
  scores?: number[];
  strategies?: any; // only used for snapshot, @todo
  // @feedback: Just create an interface that extends
  metadata?: TokenMetaData & { sender: string; abi: string };
}

// @feedback: example:
interface ProposalMetadata extends TokenMetaData {
  sender: string;
  abi: string;
}

export interface Vote {
  voter: string;
  choice: number[]; // VoteChoice;
  power: number; // voting power
}
