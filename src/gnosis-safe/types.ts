import { BigNumber } from 'ethers';

export enum AssetType {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  NATIVE_TOKEN = 'NATIVE_TOKEN',
}

export interface Asset {
  type: AssetType;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoUri?: string;
  amount: string;
  amountInUSD: number;
}

export enum TransactionType {
  SENT = 'Sent',
  RECEIVED = 'Received',
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

export interface Transaction {
  type: TransactionType;
  asset: string; // Asset address
  amount: string; // Transaction amount
  from: string; // Sender address
  to: string; // Recipient address
  txHash: string; // txHash address
  created: Date; // Transaction time
  status: TransactionStatus;
}
