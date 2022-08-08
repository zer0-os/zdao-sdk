import {
  Config as zNSConfig,
  createInstance as createZNSInstance,
  Domain,
  Instance as zNSInstance,
} from '@zero-tech/zns-sdk';
import * as zns from '@zero-tech/zns-sdk';
import { BigNumber } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { zNA, zNAConfig, zNAId } from '../types';
import { errorMessageForError } from '../utilities';
import { ZDAORecord, ZNAASSOCIATION_BY_QUERY, ZNAS_QUERY } from './types';

class zDAORegistryClient {
  private readonly _config: zNAConfig;
  private readonly _znsInstance: zNSInstance;
  private readonly _registryGQLClient;

  constructor(config: zNAConfig, zNSConfig: zNSConfig) {
    this._config = config;
    this._znsInstance = createZNSInstance(zNSConfig);
    this._registryGQLClient = new GraphQLClient(config.subgraphUri);
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
    const result = await this._registryGQLClient.request(ZNAS_QUERY);
    const promises: Promise<zNA>[] = result.znaassociations.map((zNA: any) =>
      this.zNAIdTozNA(BigNumber.from(zNA.id).toHexString())
    );
    return await Promise.all(promises);
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const result = await this._registryGQLClient.request(
      ZNAASSOCIATION_BY_QUERY,
      {
        id_in: [this.zNATozNAId(zNA)],
      }
    );
    const zNAs: zNA[] = await Promise.all(
      result.znaassociations.map((association: any) =>
        this.zNAIdTozNA(BigNumber.from(association.id).toHexString())
      )
    );
    if (zNAs.length < 1) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    return {
      id: result.znaassociations[0].zDAORecord.id.toString(),
      ens: result.znaassociations[0].zDAORecord.name,
      gnosisSafe: result.znaassociations[0].zDAORecord.gnosisSafe.toString(),
      zNAs,
    };
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    const result = await this._registryGQLClient.request(
      ZNAASSOCIATION_BY_QUERY,
      {
        id_in: [this.zNATozNAId(zNA)],
      }
    );
    return result.znaassociations.length > 0;
  }
}

export default zDAORegistryClient;
