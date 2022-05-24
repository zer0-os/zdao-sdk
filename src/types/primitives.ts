export type zNA = string;
export type zNAId = string;
export type zDAOId = string;
export type ProposalId = string;
export type VoteId = string;
export type Choice = 1 | 2; // 0: None, 1: Yes, 2: No
export type zDAOState = 'pending' | 'active' | 'canceled';
export type ProposalState =
  | 'pending' // If not sync to Polygon network
  | 'canceled'
  | 'active'
  | 'calculating' // The proposal ends and is waiting to collect
  | 'finalizing' // The proposal has been colleted on Polygon, waiting sync to Ethereum
  | 'succeeded' // The proposal has been synced to Ethereum and succeeded
  | 'failed' // The proposal has been synced to Ethereum and failed
  | 'executed';
