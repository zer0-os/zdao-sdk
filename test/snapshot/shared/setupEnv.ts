import * as dotenv from 'dotenv';

import { SupportedChainId } from '../../../src/types';

dotenv.config();

interface Env {
  rpcUrl: string;
  network: SupportedChainId;
  zDAORegistry: string;
  wallet: {
    privateKey: string;
    gnosisSafeOwner: string;
  };
  DAOs: {
    title: string;
    votingToken: string;
    safeAddress: string;
    ens: string;
  }[];
}

export const setEnv = (isDev = true): Env => {
  return isDev
    ? {
        rpcUrl: process.env.RINKEBY_RPC_URL!,
        network: SupportedChainId.RINKEBY,
        zDAORegistry: '0x73D44dEa3A3334aB2504443479aD531FfeD2d2D9',
        wallet: {
          privateKey: process.env.PRIVATE_KEY!,
          gnosisSafeOwner: process.env.GNOSIS_OWNER_PRIVATE_KEY!,
        },
        DAOs: [
          {
            title: 'zDAO Testnet',
            votingToken: '0x10F6A2795B14f13771d885D72e5925Aff647B565',
            safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
            ens: 'zdao-sky.eth',
          },
        ],
      }
    : {
        rpcUrl: process.env.MAINNET_RPC_URL!,
        network: SupportedChainId.MAINNET,
        zDAORegistry: '0x7701913b65C9bCDa4d353F77EC12123d57D77f1e',
        wallet: {
          privateKey: process.env.PRIVATE_KEY!,
          gnosisSafeOwner: process.env.GNOSIS_OWNER_PRIVATE_KEY!,
        },
        DAOs: [
          {
            title: 'Wilder Wheels',
            votingToken: '0x2a3bff78b79a009976eea096a51a948a3dc00e34',
            safeAddress: '0xEe7Ad892Fdf8d95223d7E94E4fF42E9d0cfeCAFA',
            ens: 'zdao-wilderwheels.eth',
          },
          {
            title: 'Wilder World',
            votingToken: '0x2a3bff78b79a009976eea096a51a948a3dc00e34',
            safeAddress: '0xeD42f85554530B6D5f149d60E5656715BCd4AfdA',
            ens: 'zdao-wilderworld.eth',
          },
        ],
      };
};
