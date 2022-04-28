export type zNA = string;
export type zNAId = string;
export type zDAOId = string;
export type ProposalId = string;
export type VoteId = string;
export type Choice = 1 | 2; // 0: None, 1: Yes, 2: No
export type ProposalState =
  | 'pending'
  | 'canceled'
  | 'active'
  | 'failed'
  | 'succeeded'
  | 'executed';
