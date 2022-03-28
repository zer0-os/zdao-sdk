import { BigNumber, ethers } from 'ethers';

import zDAORegistry from '../config/constants/abi/zDAORegistry.json';
import { zDAOId, zNA, zNAConfig } from '../types';
import { zNATozNAId } from '../utilities/resolve';
import { ZDAORegistry } from './contracts/ZDAORegistry';

class zDAORegistryClient {
  private readonly _config: zNAConfig;
  protected readonly _contract: ZDAORegistry;

  constructor(config: zNAConfig) {
    this._config = config;
    this._contract = new ethers.Contract(
      config.contract,
      zDAORegistry,
      config.provider
    ) as ZDAORegistry;
  }

  async listZDAOs(): Promise<zNA[]> {
    // throw Error(errorMessageForError('not-implemented'));
    const count = (await this._contract.numberOfzDAOs()).toNumber();
    const limit = 100;
    const numberOfReturns = limit;
    const zNAIds: string[] = [];

    while (numberOfReturns === limit) {
      const response = await this._contract.listzDAOs(
        0,
        Math.min(limit, count)
      );
      zNAIds.push(
        ...response.reduce((prev, cur) => {
          prev.push(
            ...cur.associatedzNAs.map((associated: BigNumber) =>
              associated.toString()
            )
          );
          return prev;
        }, [] as string[])
      );
    }
    return zNAIds;
  }

  async getZDAOIdByZNA(zNA: zNA): Promise<zDAOId> {
    const zDAORecord = await this._contract.getzDaoByZNA(zNATozNAId(zNA));
    return zDAORecord.id.toString();
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return this._contract.doeszDAOExistForzNA(zNATozNAId(zNA));
  }
}

export default zDAORegistryClient;
