export enum VoteChoice {
  Yes,
  No,
}

export interface zDAO {
  id: string; // Global zDAO identifier
  zNA: string; // Linked zNA
  title?: string; // zDAO title
  creator: string; // Creator wallet address
  owner: string; // Owner wallet address
  avatar?: string; // Avatar uri (https link)
  network: string; // Chain id
  safeAddress: string; // Gnosis Safe address
  votingToken: string; // Voting token address
}

export interface TokenMetaData {
  recipient: string; // asset recipient address
  token: string; // asset token address
  amount: string; // BigNumber string mutiplied by decimals
}

export interface Proposal {
  id: string; // proposal id
  author: string;
  title: string;
  body?: string;
  ipfs: string;
  choices: VoteChoice[];
  created: Date;
  started: Date;
  ended: Date;
  status: 'pending' | 'active' | 'closed';
  network: string;
  snapshot: string;
  scores: number[];
  metadata: TokenMetaData & { sender: string };
  zDAOId: string;
}

export interface Vote {
  voter: string;
  choice: VoteChoice;
  power: number; // voting power
}
