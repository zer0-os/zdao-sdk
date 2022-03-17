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

export type TransferInfo =
  | {
      type: AssetType.ERC20;
      tokenAddress: string;
      tokenName?: string;
      tokenSymbol?: string;
      logoUri?: string;
      decimals?: number;
      value: string;
    } // Erc20 transfer
  | {
      type: AssetType.ERC721;
      tokenAddress: string;
      tokenId: string;
      tokenName?: string;
      tokenSymbol?: string;
      logoUri?: string;
    } // Erc721 transfer
  | {
      type: AssetType.NATIVE_TOKEN;
      value: string;
    }; // Ether transfer

export interface Transaction {
  type: TransactionType;
  asset: TransferInfo; // Asset information
  from: string; // Sender address
  to: string; // Recipient address
  txHash?: string; // txHash address
  created: Date; // Transaction time
  status: TransactionStatus;
}

// export interface GnosisSafeClient {
//   transferToken(
//     recipient: string,
//     amount: string | BigNumber | number
//   ): Promise<any>;
//   transferEther(
//     recipient: string,
//     amount: string | BigNumber | number
//   ): Promise<any>;
//   getTokens(): Promise<any>;
//   getTransactions(): Promise<any>;
// }
