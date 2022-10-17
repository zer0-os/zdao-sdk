import {
  Config as zNSConfig,
  createInstance as createZNSInstance,
  Domain,
  Instance as zNSInstance,
} from '@zero-tech/zns-sdk';
import * as zns from '@zero-tech/zns-sdk';
import { BigNumber, ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { zNA, zNAConfig, zNAId } from '../types';
import { errorMessageForError } from '../utilities';
import { graphQLQuery } from '../utilities/graphql';
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
    const result = await graphQLQuery(this._registryGQLClient, ZNAS_QUERY, {
      platformType: 0,
    });
    const promises: Promise<zNA>[] = result.znaassociations.map((zNA: any) =>
      this.zNAIdTozNA(BigNumber.from(zNA.id).toHexString())
    );
    return await Promise.all(promises);
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const result = await graphQLQuery(
      this._registryGQLClient,
      ZNAASSOCIATION_BY_QUERY,
      {
        id_in: [this.zNATozNAId(zNA)],
        platformType: 0,
      }
    );
    if (
      !result ||
      !result.znaassociations ||
      result.znaassociations.length < 1
    ) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }
    const zNAs: zNA[] = await Promise.all(
      result.znaassociations[0].zDAORecord.zNAs.map((association: any) =>
        this.zNAIdTozNA(BigNumber.from(association.id).toHexString())
      )
    );

    return {
      id: result.znaassociations[0].zDAORecord.zDAOId.toString(),
      ens: result.znaassociations[0].zDAORecord.name,
      gnosisSafe: ethers.utils.getAddress(
        result.znaassociations[0].zDAORecord.gnosisSafe.toString()
      ),
      zNAs,
    };
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    const result = await graphQLQuery(
      this._registryGQLClient,
      ZNAASSOCIATION_BY_QUERY,
      {
        id_in: [this.zNATozNAId(zNA)],
        platformType: 0,
      }
    );
    return result.znaassociations.length > 0;
  }
}

export default zDAORegistryClient;
