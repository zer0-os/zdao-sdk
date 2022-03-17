import { ethers } from 'ethers';
import { Asset, Transaction } from './gnosis-safe/types';
import { Proposal, TokenMetaData, Vote, zDAO } from './snapshot-io/types';

export interface SnapshotConfig {
  serviceUri: string;
  ipfsUri: string;
}

export interface GnosisSafeConfig {
  serviceUri: string;
  safeAddress: string;
  gateway: string;
}

export interface zNAConfig {
  contract: string;
  provider: ethers.providers.Web3Provider;
}

export interface Config {
  snapshot: SnapshotConfig;
  gnosisSafe: GnosisSafeConfig;
  zNA: zNAConfig;
  chainId: string;
}

export interface CreateProposalDto {
  from: string; // user address who creates a proposal
  title: string;
  body?: string;
  duration: number; // time duration from start to end in seconds
  snapshot: number; // block number
  transfer: TokenMetaData;
}

export interface VoteProposalDto {
  from: string;
  proposal: string; // proposal id
  proposalType: string; // only used for snapshot, @todo
  choice: number; // 1 or 2
}

export interface ExecuteProposalDto {
  from: string;
  proposal: string; // proposal id
}

export interface Instance {
  /**
   * Get all the list of zDAO
   */
  // @feedback: say `list` if you're listing / providing arrays back
  // @feedback: This should be `listZDAOs()`
  getZDAOs(): Promise<zDAO[]>;

  /**
   * Get zDAO by zNA
   * @param zNA zNA address to find zDAO
   */
  // @feedback: Leave comment for return on exceptions
  // @feedback: Don't return <Value | undefined> instead throw an error if value cannot be found
  // @feedback: Provide a `doesZDAOExistAtZNA(zNA: string)` function
  getZDAOByZNA(zNA: string): Promise<zDAO | undefined>;

  /**
   * Get zDAO assets by zNAs
   * @param zNA zNA address to get zDAO Assets
   */
  // @feedback: Throw error if zDAO doesn't exist
  // @feedback: Define an interface for return structure
  // @feedback: use [] for array not Array<T>
  getZDAOAssetsByZNA(zNA: string): Promise<
    | {
        amountInUSD: number;
        assets: Array<Asset>;
      }
    | undefined
  >;

  /**
   * Get zDAO transactions by zNA
   * @param zNA zNA address to get zDAO assets
   */
  // @feedback: Throw error if zDAO doesn't exist
  // @feedback: Use standard TypeScript array, ie Transaction[]
  getZDAOTransactionsByZNA(
    zNA: string
  ): Promise<Array<Transaction> | undefined>;

  /**
   * Get all the proposals added in the zDAO
   * @param zNA zNA address
   */
  // @feedback: Throw error if zDAO doesn't exist
  // @feedback: Use standard TypeScript array, ie Transaction[]
  // @feedback: Call this `listProposalsByZDAO`
  // @feedback: Paginate this behind the scenes and fetch all proposals
  getProposalsByZDAOId(
    zNA: string,
    skip: number
  ): Promise<Array<Proposal> | undefined>;

  /**
   * Get proposal by proposal id
   * @param proposalId proposal id
   */
  // @feedback: Throw error if zDAO doesn't exist
  // @feedback: Use standard TypeScript array, ie Transaction[]
  // @feedback: Call this `getProposalDetails`
  // @feedback: Returns a different structure `ProposalDetails`
  // @feedback: `ProposalDetails` extends `Proposal`
  // @feedback: Pass simplest parameters
  getProposalById(proposalId: string): Promise<Proposal | undefined>;

  /**
   * Get all the votes by proposal id filtering with the function parameter
   * @param proposalId proposal id
   * @param first voting count to fetch
   * @param voter voter address to filter
   * @param skip start index
   */
  // @feedback: use [] and define interface
  // @feedback: don't use any
  // @feedback: use interface not inline object
  getProposalVotes(
    proposalId: string,
    { first, voter, skip }: any
  ): Promise<Array<Vote>>;

  /**
   * Get the result of proposal from votes
   * @param zNA zNA address
   * @param proposal proposal information
   * @param votes list of votes to calculate result
   */
  // @feedback use []
  // @feedback use interface for rtur
  getProposalResults(
    zNA: string,
    proposal: Proposal,
    votes: Array<Vote>
  ): Promise<
    | {
        resultsByVoteBalance: number;
        sumOfResultsBalance: number;
      }
    | undefined
  >;

  /**
   * Get voting power of the user in zDAO
   * @param zNA zNA address
   * @param account account address
   * @param proposal proposal information
   * @returns voting power as number
   */
  // @feedback: don't use any
  getVotingPower(
    zNA: string,
    account: string,
    proposal: any
  ): Promise<number | undefined>;

  /**
   * Create a proposal in zDAO
   * @param dao zDAO
   * @param payload packaged parameters to create a proposal
   * @returns proposal id if success
   */
  createProposal(
    signer: ethers.Wallet,
    dao: zDAO,
    payload: CreateProposalDto
  ): Promise<string | undefined>;

  /**
   * Cast a vote on proposal
   * @param dao zDAO
   * @param payload packaged paramters to cast a vote
   * @returns true if successfully cast a vote
   */
  voteProposal(
    signer: ethers.Wallet,
    dao: zDAO,
    payload: VoteProposalDto
  ): Promise<string | undefined>;

  /**
   * Execute a proposal in zDAO
   * @param dao zDAO
   * @param payload packaged parameters to execute a proposal
   * @returns tx hash
   */
  executeProposal(
    signer: ethers.Wallet,
    dao: zDAO,
    payload: ExecuteProposalDto
  ): Promise<string | undefined>;
}


// @feedback: consider the following:

export type zNA = string;

interface Proposal {
  id: string;
  type: string;
  title: string;
}

interface ProposalDetails extends Proposal {
  metadata: any;
  scores: any;
}

export interface ZDAOInstance {
  getAssets(): Promise<
    | {
        amountInUSD: number;
        assets: Array<Asset>;
      }
  >; 

  getTransactions(): Promise<Transaction[]>;

   listProposal(): Proposal[];

  getProposalDetails(proposal: Proposal): ProposalDetails;
}


export interface SDKInstance {
  listZDAOs(): Promise<zNA[]>;

  getZDAOByZNA(zNA: zNA): Promise<ZDAOInstance>;

  doesZDAOExist(zNA: zNA): Promise<boolean>;
}

