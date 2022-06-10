import fleek from '@fleekhq/fleek-storage-js';
import fetch from 'cross-fetch';

import { FleekConfig } from '../../types';

class IPFSClient {
  private static _config: FleekConfig;

  static initialize(config: FleekConfig) {
    IPFSClient._config = config;
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
    const url = IPFSClient.getUrl(uri, gateway);
    if (!url) return {};
    return fetch(url).then((res) => res.json());
  }

  static async getJsonByProtocol(
    gateway: string,
    ipfsHash: string,
    protocolType = 'ipfs'
  ) {
    const url = `https://${gateway}/${protocolType}/${ipfsHash}`;
    return fetch(url).then((res) => res.json());
  }

  static async upload(key: string, body: any): Promise<string> {
    const result = await fleek.upload({
      apiKey: IPFSClient._config.apiKey,
      apiSecret: IPFSClient._config.apiSecret,
      key,
      data: JSON.stringify(body),
    });
    return result.hashV0;
  }
}

export default IPFSClient;
