import { ethers } from 'ethers';

import { PlatformType } from '../..';
import { CreateZDAOParams, DAOConfig, zDAOId } from '../../types';
import GlobalClient from '../client/GlobalClient';
import SnapshotZDAOChefAbi from '../config/abi/SnapshotZDAOChef.json';
import { SnapshotZDAOChef } from '../config/types/SnapshotZDAOChef';
import { CreateZDAOParamsOptions } from '../types';
import { SnapshotZDAOProperties } from './types';

class ZDAOChefClient {
  private readonly _config: DAOConfig;
  protected _contract: SnapshotZDAOChef;

  constructor(config: DAOConfig) {
    this._config = config;
    this._contract = new ethers.Contract(
      config.zDAOChef,
      SnapshotZDAOChefAbi.abi,
      GlobalClient.etherRpcProvider
    ) as SnapshotZDAOChef;
  }

  get config(): DAOConfig {
    return this._config;
  }

  async getZDAOPropertiesById(zDAOId: zDAOId): Promise<SnapshotZDAOProperties> {
    const zDAORecord = await GlobalClient.zDAORegistry.getZDAORecordById(
      zDAOId
    );
    const zDAOInfo = await this._contract.zDAOInfos(zDAORecord.id);
    return {
      id: zDAOInfo.id.toString(),
      snapshot: zDAOInfo.snapshot.toNumber(),
      ensSpace: zDAOInfo.ensSpace,
      gnosisSafe: zDAOInfo.gnosisSafe,
      destroyed: zDAOInfo.destroyed,
    };
  }

  async addNewDAO(signer: ethers.Signer, payload: CreateZDAOParams) {
    await GlobalClient.zDAORegistry.addNewZDAO(
      signer,
      PlatformType.Snapshot,
      payload.zNA,
      payload.gnosisSafe,
      ethers.utils.defaultAbiCoder.encode(
        ['string'],
        [(payload.options as CreateZDAOParamsOptions).ens]
      )
    );
  }

  async removeDAO(signer: ethers.Signer, zDAOId: zDAOId) {
    await GlobalClient.zDAORegistry.removeNewZDAO(signer, zDAOId);
  }
}

export default ZDAOChefClient;
