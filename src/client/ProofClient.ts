import { POSClient, setProofApi, use } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';

import { Config } from '../types';

class ProofClient {
  static proofApi = 'https://apis.matic.network/';
  static SEND_MESSAGE_EVENT_SIG =
    '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036';

  static _posClient: POSClient;

  static async initialize(config: Config) {
    setProofApi(ProofClient.proofApi);
    use(Web3ClientPlugin);

    ProofClient._posClient = new POSClient();

    await ProofClient._posClient.init({
      network: config.isProd ? 'mainnet' : 'testnet',
      version: config.isProd ? 'v1' : 'mumbai',
      parent: {
        provider: process.env.GOERLI_RPC_URL as string,
        defaultConfig: {
          from: config.proof.from,
        },
      },
      child: {
        provider: process.env.MUMBAI_RPC_URL as string,
        defaultConfig: {
          from: config.proof.from,
        },
      },
    });
  }

  static isCheckPointed(txHash: string): Promise<boolean> {
    return ProofClient._posClient.isCheckPointed(txHash);
  }

  static generate(txHash: string): Promise<string> {
    return ProofClient._posClient.exitUtil.buildPayloadForExit(
      txHash,
      ProofClient.SEND_MESSAGE_EVENT_SIG,
      true
    );
  }
}

export default ProofClient;
