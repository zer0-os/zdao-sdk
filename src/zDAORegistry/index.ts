import {
  Config as zNSConfig,
  createInstance as createZNSInstance,
  Domain,
  Instance as zNSInstance,
} from '@zero-tech/zns-sdk';
import * as zns from '@zero-tech/zns-sdk';
import { BigNumber, ethers } from 'ethers';

import zDAORegistry from '../config/constants/abi/zDAORegistry.json';
import { zNA, zNAConfig, zNAId } from '../types';
import { ensIdToENS } from '../utilities/resolve';
import { ZDAORegistry } from './contracts/ZDAORegistry';
import { ZDAORecord } from './types';

class zDAORegistryClient {
  private readonly _config: zNAConfig;
  protected readonly _contract: ZDAORegistry;
  private readonly _znsInstance: zNSInstance;

  constructor(config: zNAConfig, zNSConfig: zNSConfig) {
    this._config = config;
    this._contract = new ethers.Contract(
      config.contract,
      zDAORegistry,
      config.provider
    ) as ZDAORegistry;
    this._znsInstance = createZNSInstance(zNSConfig);
  }

  private async zNAIdTozNA(zNAId: zNAId): Promise<zNA> {
    return this._znsInstance
      .getDomainById(zNAId)
      .then((domain: Domain) => domain.name);
  }

  private zNATozNAId(zNA: zNA): zNAId {
    return zns.domains.domainNameToId(zNA);
  }

  async listZNAs(): Promise<zNA[]> {
    const count = (await this._contract.numberOfzDAOs()).toNumber();
    const limit = 100;
    const numberOfReturns = limit;
    const zNAs: string[] = [];

    while (numberOfReturns === limit) {
      const response = await this._contract.listzDAOs(
        0,
        Math.min(limit, count)
      );
      const promises: Promise<zNAId>[] = [];
      for (const record of response) {
        const zNAIds: string[] = record.associatedzNAs.map(
          (associated: BigNumber) => associated.toString()
        );
        for (const zNAId of zNAIds) {
          promises.push(this.zNAIdTozNA(zNAId));
        }
      }
      const result: zNAId[] = await Promise.all(promises);
      zNAs.push(...result);
    }
    return zNAs;
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const zDAORecord = await this._contract.getzDaoByZNA(this.zNATozNAId(zNA));
    return {
      id: zDAORecord.id.toString(),
      ens: ensIdToENS(zDAORecord.ensId.toString()),
      gnosisSafe: zDAORecord.gnosisSafe.toString(),
      zNA: zNA,
    };
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return this._contract.doeszDAOExistForzNA(this.zNATozNAId(zNA));
  }
}

export default zDAORegistryClient;
