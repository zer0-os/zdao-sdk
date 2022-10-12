import * as dotenv from 'dotenv';
import * as env from 'env-var';

import { SupportedChainId } from '../../src/types';

dotenv.config();

interface Env {
  rpcUrl: string;
  network: SupportedChainId;
  zDAORegistry: string;
  privateKey: string;
  DAOs: {
    title: string;
    votingToken: string;
    safeAddress: string;
    ens: string;
    zNAs: string[];
    duration?: number;
  }[];
}

export const setEnv = (isDev = true): Env => {
  return isDev
    ? {
        rpcUrl: env.get('GOERLI_RPC_URL').required().asString(),
        network: SupportedChainId.GOERLI,
        privateKey: env.get('TESTNET_PRIVATE_KEY').required().asString(),
        zDAORegistry: '0x4d681D8245e956E1cb295Abe870DF6736EA5F70e',
        DAOs: [
          {
            title: 'zDAO SKY Tester',
            votingToken: '0x0e46c45f8aca3f89Ad06F4a20E2BED1A12e4658C',
            safeAddress: '0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa',
            ens: 'zdao-sky.eth',
            zNAs: ['wilder.cats', 'wilder.skydao'],
            duration: 86400,
          },
          {
            title: 'zDAO 721 Test',
            votingToken: '0x009A11617dF427319210e842D6B202f3831e0116',
            safeAddress: '0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa',
            ens: 'zdao721test.eth',
            zNAs: ['wilder.moto'],
            duration: 172800,
          },
        ],
      }
    : {
        rpcUrl: env.get('MAINNET_RPC_URL').required().asString(),
        network: SupportedChainId.MAINNET,
        zDAORegistry: '0x7701913b65C9bCDa4d353F77EC12123d57D77f1e',
        privateKey: env.get('MAINNET_PRIVATE_KEY').required().asString(),
        DAOs: [
          {
            title: 'Wilder World',
            votingToken: '0x2a3bff78b79a009976eea096a51a948a3dc00e34',
            safeAddress: '0x766A9b866930D0C7f673EB8Fc9655D5f782b2B21',
            ens: 'zdao-wilderworld.eth',
            zNAs: ['wilder'],
            duration: 259200,
          },
          {
            title: 'Wilder Wheels',
            votingToken: '0xc2e9678A71e50E5AEd036e00e9c5caeb1aC5987D',
            safeAddress: '0xEe7Ad892Fdf8d95223d7E94E4fF42E9d0cfeCAFA',
            ens: 'zdao-ww-beasts.eth',
            zNAs: ['wilder.wheels'],
            duration: 604800,
          },
          {
            title: 'Wilder Beasts',
            votingToken: '0x1a178cfd768f74b3308cbca9998c767f4e5b2cf8',
            safeAddress: '0x766A9b866930D0C7f673EB8Fc9655D5f782b2B21',
            ens: 'zdao-ww-beasts.eth',
            zNAs: ['wilder.beasts'],
            duration: 604800,
          },
          {
            title: 'Wilder Kicks',
            votingToken: '0x2a3bff78b79a009976eea096a51a948a3dc00e34',
            safeAddress: '0x2A83Aaf231644Fa328aE25394b0bEB17eBd12150',
            ens: 'zdao-ww-kicks.eth',
            zNAs: ['wilder.kicks'],
            duration: 604800,
          },
          {
            title: 'Wilder Moto',
            votingToken: '0x51bd5948cf84a1041d2720f56ded5e173396fc95',
            safeAddress: '0x624fb845A6b2C64ea10fF9EBe710f747853022B3',
            ens: 'zdao-moto.eth',
            zNAs: ['wilder.moto'],
            duration: 604800,
          },
        ],
      };
};
