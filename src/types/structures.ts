import {
  AssetType,
  ProposalState,
  TransactionStatus,
  TransactionType,
} from './enumerations';
import { Choice, ENS, ProposalId, zDAOId, zNA } from './primitives';

export interface Vote {
  voter: string;
  choice: Choice;
  power: number; // voting power
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
  txHash: string; // Transaction hash
  status: TransactionStatus;
}

export interface zDAOCoins {
  // total coin amount in USD
  amountInUSD: number;
  // list of assets in zDAO
  coins: Coin[];
}

export type zDAOCollectibles = Collectible[];

export type zDAOAssets = zDAOCoins & { collectibles: zDAOCollectibles };

export interface Token {
  token: string; // asset token address
  decimals: number;
  symbol: string; // token symbol
}

export interface TokenMetaData extends Token {
  sender: string;
  recipient: string; // asset recipient address
  amount: string; // BigNumber string mutiplied by decimals
}

export interface zDAOProperties {
  id: zDAOId; // Global zDAO identifier
  ens: ENS; // Ethereum Name Service
  zNAs: zNA[]; // Linked zNA
  title: string; // zDAO title, zNA by default
  creator: string; // Creator wallet address
  network: string; // Chain id
  duration?: number; // Proposal duration if DAO has fixed duration
  safeAddress: string; // Gnosis Safe address
  votingToken: Token; // Voting token
  amount: string; // Minimum amount of voting power to create a proposal
  totalSupplyOfVotingToken: string; // total supply of voting token in bignumber
  votingThreshold: number; // Threshold in 100% as 10000 required to check if proposal is succeeded
  minimumVotingParticipants: number; // Minimum number of voters required for the proposal to pass
  minimumTotalVotingTokens: string; // Minimum amount of voting power required for the proposal to pass
  isRelativeMajority: boolean; // True if relative majority
}

export interface ProposalProperties {
  id: ProposalId; // proposal id
  type: string; // proposal type, by default 'single-choice'
  author: string; // proposal creator address
  title: string; // proposal title
  body: string; // proposal body
  ipfs: string; // uri to ipfs which contains proposal information and signature
  choices: string[];
  created: Date;
  start: Date;
  end: Date;
  state: ProposalState;
  network: string; // chain id
  snapshot: number; // snapshot block number
  scores: number[]; // scores per all the choices
  votes: number; // number of voters
  metadata?: TokenMetaData; // token meta data is stored in ipfs
}
