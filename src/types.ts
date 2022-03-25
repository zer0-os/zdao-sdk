import {
  Provider,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { Wallet } from '@ethersproject/wallet';

/* -------------------------------------------------------------------------- */
/*                                Configuration                               */
/* -------------------------------------------------------------------------- */
export interface SnapshotConfig {
  // uri to Snaphost Hub
  serviceUri: string;
  // ipfs gateway
  ipfsGateway: string;
}

export interface GnosisSafeConfig {
  // uri to Gnosis Safe service
  serviceUri: string;
  // uri to Gnosis Safe gateway
  gateway: string;
}

export interface zNAConfig {
  // address to zDAOCore contract
  contract: string;
  // web3 provider
  provider: Provider;
}

export interface Config {
  snapshot: SnapshotConfig;
  gnosisSafe: GnosisSafeConfig;
  zNA: zNAConfig;
}

/* -------------------------------------------------------------------------- */
/*                               Primitive Types                              */
/* -------------------------------------------------------------------------- */

export type zNA = string;
export type zDAOId = string;
export type ProposalId = string;

/* -------------------------------------------------------------------------- */
/*                                Enumerations                                */
/* -------------------------------------------------------------------------- */

export enum SupportedChainId {
  ETHEREUM = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
}

export enum VoteChoice {
  YES = 'Yes',
  NO = 'No',
}

export enum AssetType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  NATIVE_TOKEN = 'NATIVE_TOKEN',
}

export enum TransactionType {
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
}

export enum TransactionStatus {
  AWAITING_CONFIRMATIONS = 'AWAITING_CONFIRMATIONS',
  AWAITING_EXECUTION = 'AWAITING_EXECUTION',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  WILL_BE_REPLACED = 'WILL_BE_REPLACED',
}

/* -------------------------------------------------------------------------- */
/*                            Structure Interfaces                            */
/* -------------------------------------------------------------------------- */

export type Choice = 1 | 2;
export interface Vote {
  voter: string;
  choice: Choice;
  power: number; // voting power
}

export interface Asset {
  type: AssetType;
  // address to ERC20 token or ERC721 token, or empty if native coin
  address: string;
  // token name
  name: string;
  // token decimals
  decimals: number;
  // token symbol
  symbol: string;
  // token logo
  logoUri?: string;
  // bignumber of token amount in wei unit
  amount: string;
  // token amount in USD
  amountInUSD: number;
}

export interface ERC20Transfer {
  type: AssetType.ERC20;
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  logoUri?: string;
  decimals?: number;
  value: string;
}

export interface ERC721Transfer {
  type: AssetType.ERC721;
  tokenAddress: string;
  tokenId: string;
  tokenName?: string;
  tokenSymbol?: string;
  logoUri?: string;
}

export interface NativeCoinTransfer {
  type: AssetType.NATIVE_TOKEN;
  value: string;
}

export type TransferInfo = ERC20Transfer | ERC721Transfer | NativeCoinTransfer;

export interface Transaction {
  type: TransactionType;
  asset: TransferInfo; // Asset information
  from: string; // Sender address
  to: string; // Recipient address
  created: Date; // Transaction time
  status: TransactionStatus;
}

export interface zDAOAssets {
  // total asset amount in USD
  amountInUSD: number;
  // list of assets in zDAO
  assets: Asset[];
}

export interface TokenMetaData {
  sender: string;
  recipient: string; // asset recipient address
  token: string; // asset token address
  decimals: number;
  symbol: string; // token symbol
  amount: string; // BigNumber string mutiplied by decimals
}

/* -------------------------------------------------------------------------- */
/*                                   Params                                   */
/* -------------------------------------------------------------------------- */

export interface CreateZDAOParams {
  // zNA
  zNA: zNA;
  // zDAO title
  title: string;
  // address to zDAO creator
  creator: string;
  // uri to avatar, if not defined, will use default avatar image in frontend
  avatar?: string;
  // network id where zDAO was created
  network: SupportedChainId;
  // adress to Gnosis Safe
  safeAddress: string;
  // addresses to Gnosis Safe owners
  owners: string[];
  // ERC20 token address to cast a vote
  votingToken: string;
}

export interface CreateProposalParams {
  title: string;
  // If the proposal does not have content, no need to set this member
  body?: string;
  duration: number; // time duration from start to end in seconds
  snapshot: number; // block number
  transfer: TokenMetaData;
}

export interface VoteProposalParams {
  proposal: string; // proposal id
  choice: Choice; // Yes or No
}

export interface ExecuteProposalParams {
  proposal: string; // proposal id
}

/* -------------------------------------------------------------------------- */
/*                             Instance Interfaces                            */
/* -------------------------------------------------------------------------- */
export interface SDKInstance {
  /**
   * Get all the list of zDAO
   * @returns list of zNA
   */
  listZDAOs(): Promise<zNA[]>;

  /**
   * Create an zDAO instance by zNA
   * @param zNA zNA address
   * @returns created zDAO instance
   * @exception throw Error if zNA does not exist
   */
  getZDAOByZNA(zNA: zNA): Promise<zDAO>;

  /**
   * Check if zDAO exists
   * @param zNA zNA address
   * @returns true if zNA exists
   */
  doesZDAOExist(zNA: zNA): Promise<boolean>;

  /**
   * Create zDAO from parameters for test
   * @param packaged parameters of zDAO
   * @exception throw Error if zNA already exists
   * @exception throw Error if owners is empty
   * @exception throw Error if title is empty
   */
  createZDAOFromParams(param: CreateZDAOParams): Promise<void>;
}

export interface zDAO {
  id: zDAOId; // Global zDAO identifier
  zNA: zNA; // Linked zNA
  title: string; // zDAO title, zNA by default
  creator: string; // Creator wallet address
  // avatar uri which starts with https schema
  // The frontend should use default avatar image if not defined
  avatar?: string; // Avatar uri (https link)
  network: string; // Chain id
  safeAddress: string; // Gnosis Safe address
  votingToken: string; // Voting token address

  /**
   * Get the list of zDAO assets and amount in USD
   * @returns assets in zDAO
   */
  listAssets(): Promise<zDAOAssets>;

  /**
   * Get the list of zDAO transactions
   * @returns list of transactions
   */
  listTransactions(): Promise<Transaction[]>;

  /**
   * Get the list of the proposals created in the zDAO
   * @param from start index
   * @param count number of proposals to fetch
   * @return list of proposals
   */
  listProposals(from: number, count: number): Promise<Proposal[]>;

  /**
   * Get the specific proposal
   * @param id proposal id
   * @returns proposal instance
   * @exception throw Error if not exist proposal id
   */
  getProposal(id: ProposalId): Promise<Proposal>;

  /**
   * Create a proposal in zDAO
   * @param signer signer wallet
   * @param payload packaged parameters to create a proposal
   * @returns proposal id if success
   */
  createProposal(
    signer: Wallet,
    payload: CreateProposalParams
  ): Promise<Proposal>;
}

export interface Proposal {
  id: ProposalId; // proposal id
  type: string; // proposal type, by default 'single-choice'
  author: string; // proposal creator address
  title: string; // proposal title
  body?: string; // empty body if not defined
  ipfs: string; // uri to ipfs which contains proposal information and signature
  choices: VoteChoice[];
  created: Date;
  start: Date;
  end: Date;
  state: 'pending' | 'active' | 'closed';
  network: string; // chain id
  snapshot: string; // snapshot block number
  scores: number[]; // scores per all the choices
  votes: number; // number of voters
  // token meta data is stored in ipfs, this member can be valid after calling
  // `getTokenMetadata` function
  metadata?: TokenMetaData;

  getTokenMetadata(): Promise<TokenMetaData>;

  /**
   * Get all the votes by proposal id filtering with the function parameter
   * @param from start index
   * @param count voting count to fetch
   * @param voter voter address to filter
   * @returns list of votes
   */
  listVotes(from: number, count: number, voter: string): Promise<Vote[]>;

  /**
   * Get voting power of the user in zDAO
   * @param account account address
   * @returns voting power as number
   */
  getVotingPowerOfUser(account: string): Promise<number>;

  /**
   * Cast a vote on proposal
   * @param signer signer wallet
   * @param choice voter's choice
   * @returns vote id if successfully cast a vote
   */
  vote(signer: Wallet, choice: Choice): Promise<string>;

  /**
   * Execute a proposal in zDAO
   * @param signer signer wallet
   * @returns transaction response
   * @exception throw Error if signer is not Gnosis Safe owner
   * @exception throw Error if proposal does not conain meta data to transfer tokens
   */
  execute(signer: Wallet): Promise<TransactionResponse>;
}
