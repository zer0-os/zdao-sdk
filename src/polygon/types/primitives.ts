export type zNA = string;
export type zNAId = string;
export type zDAOId = string;
export type ProposalId = string;
export type VoteId = string;
export type Choice = 1 | 2; // 0: None, 1: Yes, 2: No
export type zDAOState = 'pending' | 'active' | 'canceled';
export type ProposalState =
  // The proposal was created and waiting to synchronized to Polygon
  | 'pending'
  // The proposal was canceled before calculation
  | 'canceled'
  // The proposal was successfully created and sychronized to Polygon,
  // voters can participate a voting.
  | 'active'
  // The proposal was ended and ready to calculate voting result on Polygon
  // and send it to Ethereum
  | 'awaiting-calculation'
  // The proposal was triggerred the calculation of voting result on Polygon
  // and sending it to Ethereum
  | 'bridging'
  // The calculated voting result was arrived on Ethereum and ready to
  // finalize result
  | 'awaiting-finalization'
  // The proposal was succeeded on voting and ready to execute proposal
  | 'awaiting-execution'
  // The proposal was failed on voting
  | 'failed'
  // The proposal was successfully executed
  | 'executed';
