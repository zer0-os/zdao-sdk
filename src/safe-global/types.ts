import { SupportedChainId } from '../types';

export interface SafeGlobalAccountDetails {
  network: SupportedChainId; // Chain Id
  safeAddress: string; // safe global account address
  owners: string[]; // list of safe owners
  threshold: number; // number of required confirmation from owners
}
