import {
  AssetType,
  TransactionStatus,
  TransactionType,
  VoteChoice,
} from './enumerations';
import { Choice, ProposalId, zDAOId, zNA } from './primitives';

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
  abi: string;
  sender: string;
  recipient: string; // asset recipient address
  token: string; // asset token address
  decimals: number;
  symbol: string; // token symbol
  amount: string; // BigNumber string mutiplied by decimals
}

export interface zDAOProperties {
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
}

export interface ProposalProperties {
  id: ProposalId; // proposal id
  type: string; // proposal type, by default 'single-choice'
  author: string; // proposal creator address
  title: string; // proposal title
  body: string; // proposal body
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
}
