import { ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { PlatformType } from '../..';
import { EthereumDAOConfig, zDAOId } from '../../types';
import { generateZDAOId, graphQLQuery, validateAddress } from '../../utilities';
import GlobalClient from '../client/GlobalClient';
import { SnapshotZDAOChef__factory } from '../config/types/factories/SnapshotZDAOChef__factory';
import { SnapshotZDAOChef } from '../config/types/SnapshotZDAOChef';
import { CreateSnapshotZDAOParams } from '../types';
import { ETHEREUMZDAOS_BY_QUERY, SnapshotZDAOProperties } from './types';

class EthereumZDAOChefClient {
  private readonly config: EthereumDAOConfig;
  protected readonly contract: SnapshotZDAOChef;
  private readonly zDAOGQLClient: GraphQLClient;

  constructor(config: EthereumDAOConfig, provider: ethers.providers.Provider) {
    this.config = config;
    this.contract = SnapshotZDAOChef__factory.connect(
      config.zDAOChef,
      provider
    );
    this.zDAOGQLClient = new GraphQLClient(config.subgraphUri);
  }

  async getZDAOPropertiesById(
    zDAOId: zDAOId
  ): Promise<SnapshotZDAOProperties | undefined> {
    const result = await graphQLQuery(
      this.zDAOGQLClient,
      ETHEREUMZDAOS_BY_QUERY,
      {
        zDAOId: generateZDAOId(PlatformType.Snapshot, zDAOId),
      }
    );
    if (
      !result ||
      !Array.isArray(result.snapshotZDAOs) ||
      result.snapshotZDAOs.length < 1
    ) {
      return undefined;
    }

    const zDAO = result.snapshotZDAOs[0];
    return {
      id: zDAO.zDAORecord.zDAOId,
      snapshot: zDAO.snapshot,
      ensSpace: zDAO.ensSpace,
      gnosisSafe: validateAddress(zDAO.zDAORecord.gnosisSafe.toString()),
      destroyed: zDAO.zDAORecord.destroyed,
    };
  }

  async addNewZDAO(signer: ethers.Signer, payload: CreateSnapshotZDAOParams) {
    await GlobalClient.zDAORegistry.addNewZDAO(
      signer,
      PlatformType.Snapshot,
      payload.zNA,
      payload.gnosisSafe,
      payload.name,
      ethers.utils.defaultAbiCoder.encode(['string'], [payload.ens])
    );
  }

  async removeZDAO(signer: ethers.Signer, zDAOId: zDAOId) {
    await GlobalClient.zDAORegistry.removeZDAO(signer, zDAOId);
  }
}

export default EthereumZDAOChefClient;
