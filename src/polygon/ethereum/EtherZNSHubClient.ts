import { ethers } from 'ethers';

import GlobalClient from '../client/GlobalClient';
import IZNSHubAbi from '../config/abi/IZNSHub.json';
import { IZNSHub } from '../config/types/IZNSHub';
import { zNAId } from '../types';

class EtherZNSHubClient {
  protected readonly _contract: IZNSHub;

  constructor(address: string) {
    this._contract = new ethers.Contract(
      address,
      IZNSHubAbi.abi,
      GlobalClient.etherRpcProvider
    ) as IZNSHub;
  }

  async ownerOf(zNAId: zNAId): Promise<string> {
    return this._contract.ownerOf(zNAId);
  }
}

export default EtherZNSHubClient;
