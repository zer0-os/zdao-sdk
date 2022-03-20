export enum AssetType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  NATIVE_TOKEN = 'NATIVE_TOKEN',
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
  txHash?: string; // txHash address
  created: Date; // Transaction time
  status: TransactionStatus;
}
