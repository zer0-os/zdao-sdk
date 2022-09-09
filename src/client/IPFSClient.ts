import fleek from '@fleekhq/fleek-storage-js';
import fetch from 'cross-fetch';

import { FleekConfig, NetworkError } from '../types';

class IPFSClient {
  private static config: FleekConfig;

  static initialize(config: FleekConfig) {
    IPFSClient.config = config;
  }

  private static getUrl(uri: string, gateway: string): string | null {
    const ipfsGateway = `https://${gateway}`;
    if (!uri) return null;
    if (
      !uri.startsWith('ipfs://') &&
      !uri.startsWith('ipns://') &&
      !uri.startsWith('https://') &&
      !uri.startsWith('http://')
    )
      return `${ipfsGateway}/ipfs/${uri}`;
    const uriScheme = uri.split('://')[0];
    if (uriScheme === 'ipfs')
      return uri.replace('ipfs://', `${ipfsGateway}/ipfs/`);
    if (uriScheme === 'ipns')
      return uri.replace('ipns://', `${ipfsGateway}/ipns/`);
    return uri;
  }

  static async getJson(uri: string, gateway: string) {
    try {
      const url = IPFSClient.getUrl(uri, gateway);
      if (!url) return {};
      return fetch(url).then((res) => res.json());
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }

  static async getJsonByProtocol(
    gateway: string,
    ipfsHash: string,
    protocolType = 'ipfs'
  ) {
    try {
      const url = `https://${gateway}/${protocolType}/${ipfsHash}`;
      return fetch(url).then((res) => res.json());
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }

  static async upload(key: string, body: any): Promise<string> {
    try {
      const result = await fleek.upload({
        apiKey: IPFSClient.config.apiKey,
        apiSecret: IPFSClient.config.apiSecret,
        key,
        data: JSON.stringify(body),
      });
      return result.hashV0;
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }
}

export default IPFSClient;
