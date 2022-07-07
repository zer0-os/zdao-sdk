import { ethers } from 'ethers';

import { PlatformType } from '../..';
import { DAOConfig, zDAOId } from '../../types';
import GlobalClient from '../client/GlobalClient';
import SnapshotZDAOChefAbi from '../config/abi/SnapshotZDAOChef.json';
import { SnapshotZDAOChef } from '../config/types/SnapshotZDAOChef';
import { CreateSnapshotZDAOParams } from '../types';
import { SnapshotZDAOProperties } from './types';

class EthereumZDAOChefClient {
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
    const zDAOInfo = await this._contract.zDAOInfos(zDAOId);
    return {
      id: zDAOInfo.id.toString(),
      snapshot: zDAOInfo.snapshot.toNumber(),
      ensSpace: zDAOInfo.ensSpace,
      gnosisSafe: zDAOInfo.gnosisSafe,
      destroyed: zDAOInfo.destroyed,
    };
  }

  async addNewDAO(signer: ethers.Signer, payload: CreateSnapshotZDAOParams) {
    await GlobalClient.zDAORegistry.addNewZDAO(
      signer,
      PlatformType.Snapshot,
      payload.zNA,
      payload.gnosisSafe,
      payload.name,
      ethers.utils.defaultAbiCoder.encode(['string'], [payload.ens])
    );
  }

  async removeDAO(signer: ethers.Signer, zDAOId: zDAOId) {
    await GlobalClient.zDAORegistry.removeNewZDAO(signer, zDAOId);
  }
}

export default EthereumZDAOChefClient;
