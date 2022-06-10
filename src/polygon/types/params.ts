export interface CreateZDAOParamsOptions {
  // Threshold in 100% as 10000 required to check if proposal is succeeded
  votingThreshold: number;

  // True if relative majority to calculate voting result
  isRelativeMajority: boolean;

  // The number of voters in support of a proposal required in order
  // for a vote to succeed
  minimumVotingParticipants: number;

  // The number of votes in support of a proposal required in order
  // for a vote to succeed
  minimumTotalVotingTokens: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CreateProposalParamsOptions {}
