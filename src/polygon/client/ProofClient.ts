import { POSClient, setProofApi, use } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';

import { PolygonConfig } from '../types';

class ProofClient {
  static readonly PROOF_API = 'https://apis.matic.network/';
  static readonly SEND_MESSAGE_EVENT_SIG =
    '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036';

  static posClient: POSClient;

  static async initialize(config: PolygonConfig) {
    setProofApi(ProofClient.PROOF_API);
    use(Web3ClientPlugin);

    ProofClient.posClient = new POSClient();

    await ProofClient.posClient.init({
      network: config.isProd ? 'mainnet' : 'testnet',
      version: config.isProd ? 'v1' : 'mumbai',
      parent: {
        provider: config.ethereumProvider,
        defaultConfig: {
          from: config.proof.from,
        },
      },
      child: {
        provider: config.polygonProvider,
        defaultConfig: {
          from: config.proof.from,
        },
      },
    });
  }

  static isCheckPointed(txHash: string): Promise<boolean> {
    return ProofClient.posClient.isCheckPointed(txHash);
  }

  static generate(txHash: string): Promise<string> {
    return ProofClient.posClient.exitUtil.buildPayloadForExit(
      txHash,
      ProofClient.SEND_MESSAGE_EVENT_SIG,
      true
    );
  }
}

export default ProofClient;
