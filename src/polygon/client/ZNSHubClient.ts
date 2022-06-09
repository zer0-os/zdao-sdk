import EtherZNSHubClient from '../ethereum/EtherZNSHubClient';
import { zNAId } from '../types';

class ZNSHubClient {
  protected _etherZNSHubClient: EtherZNSHubClient;

  constructor(address: string) {
    this._etherZNSHubClient = new EtherZNSHubClient(address);
  }

  async isOwnerOf(zNAId: zNAId, account: string): Promise<boolean> {
    const owner = await this._etherZNSHubClient.ownerOf(zNAId);
    return owner.toLowerCase() === account.toLowerCase();
  }
}

export default ZNSHubClient;
