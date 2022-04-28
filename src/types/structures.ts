import {
  AssetType,
  TransactionStatus,
  TransactionType,
  VoteChoice,
} from './enumerations';
import { Choice, ProposalId, ProposalState, zDAOId, zNA } from './primitives';

export interface Vote {
  // Voter address
  voter: string;

  // Voter choice, yes or no
  choice: Choice;

  // The number of votes which the voter casted
  votes: number;
}

export interface Coin {
  type: AssetType;

  // address to ERC20 token, or empty if native coin
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

export interface Collectible {
  // address to ERC721 token
  address: string;

  // token name
  tokenName: string;

  // token symbol
  tokenSymbol: string;

  // token id
  id: string;

  // token logo
  logoUri?: string;

  // collectible name
  name: string;

  // collectible description
  description: string;

  // collectible logo
  imageUri?: string;

  // metadata, it includes attributes, description, etc...
  metadata: { [key: string]: string };
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
  // total coin amount in USD
  amountInUSD: number;

  // list of assets in zDAO
  coins: Coin[];

  // list of collectibles in zDAO
  collectibles: Collectible[];
}

export interface TokenMetaData {
  abi: string;

  sender: string;

  recipient: string; // asset recipient address

  token: string; // asset token address

  decimals: number;

  symbol: string; // token symbol

  amount: string; // BigNumber string mutiplied by decimals
}

export interface zDAOProperties {
  // Unique id for looking up zDAO
  id: zDAOId;

  // Array of zNA ids associated with zDAO
  zNAs: zNA[];

  // Title of the zDAO
  title: string;

  // Address who created zDAO, is the first zDAO owner
  createdBy: string;

  // Chain Id
  network: number;

  // Gnosis safe address where collected treasuries are stored
  gnosisSafe: string;

  // Voting token (ERC20 or ERC721) on Ethereum, only token holders
  // can create a proposal
  token: string;

  // The minimum number of tokens required to become proposal creator
  amount: string;

  // True if relative majority to calculate voting result
  isRelativeMajority: boolean;

  // The number of votes in support of a proposal required in order
  // for a vote to succeed
  quorumVotes: string;

  // Snapshot block number on which zDAO has been created
  snapshot: number;

  // Flag marking whether the zDAO has been destroyed
  destroyed: boolean;
}

export interface ProposalProperties {
  // Unique id for looking up proposal
  id: ProposalId;

  // Address who created proposal
  createdBy: string;

  // Title of the proposal
  title: string;

  // Content of the proposal
  body: string;

  // IPFS hash which contains meta information of this proposal
  ipfs: string;

  // List of choices which voter can choose
  choices: VoteChoice[];

  // Proposal start time
  start: Date;

  // Proposal end time
  end: Date;

  // Proposal state
  state: ProposalState;

  // Snapshot block number on which proposal has been created
  snapshot: number;

  // All the casted votes per choices, this should be matched with `choices`
  scores?: number[];

  // Number of voters who casted votes
  voters?: number;

  // Token meta data is stored in ipfs, should be initialized after the
  // creation of proposal instance
  metadata?: TokenMetaData;
}
