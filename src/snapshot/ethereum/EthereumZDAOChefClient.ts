import { ethers } from 'ethers';

import { PlatformType } from '../..';
import { EthereumDAOConfig, zDAOId } from '../../types';
import GlobalClient from '../client/GlobalClient';
import { SnapshotZDAOChef__factory } from '../config/types/factories/SnapshotZDAOChef__factory';
import { SnapshotZDAOChef } from '../config/types/SnapshotZDAOChef';
import { CreateSnapshotZDAOParams } from '../types';
import { SnapshotZDAOProperties } from './types';

class EthereumZDAOChefClient {
  private readonly config: EthereumDAOConfig;
  protected readonly contract: SnapshotZDAOChef;

  constructor(config: EthereumDAOConfig, provider: ethers.providers.Provider) {
    this.config = config;
    this.contract = SnapshotZDAOChef__factory.connect(
      config.zDAOChef,
      provider
    );
  }

  async getZDAOPropertiesById(zDAOId: zDAOId): Promise<SnapshotZDAOProperties> {
    const zDAOInfo = await this.contract.zDAOInfos(zDAOId);
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
