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
  private readonly config: zNAConfig;
  private readonly znsInstance: zNSInstance;
  private readonly registryGQLClient;

  constructor(config: zNAConfig, zNSConfig: zNSConfig) {
    this.config = config;
    this.znsInstance = createZNSInstance(zNSConfig);
    this.registryGQLClient = new GraphQLClient(config.subgraphUri);
  }

  private async zNAIdTozNA(zNAId: zNAId): Promise<zNA> {
    try {
      return this.znsInstance
        .getDomainById(zNAId)
        .then((domain: Domain) => domain.name);
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message,
        })
      );
    }
  }

  private zNATozNAId(zNA: zNA): zNAId {
    try {
      return zns.domains.domainNameToId(zNA);
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message,
        })
      );
    }
  }

  async listZNAs(): Promise<zNA[]> {
    const result = await graphQLQuery(this.registryGQLClient, ZNAS_QUERY, {
      platformType: 0,
    });
    const promises: Promise<zNA>[] = result.znaassociations.map((zNA: any) =>
      this.zNAIdTozNA(BigNumber.from(zNA.id).toHexString())
    );
    return await Promise.all(promises);
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const result = await graphQLQuery(
      this.registryGQLClient,
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

    const zDAORecord = result.znaassociations[0].zDAORecord;
    return {
      id: zDAORecord.zDAOId.toString(),
      ens: zDAORecord.name,
      gnosisSafe: ethers.utils.getAddress(zDAORecord.gnosisSafe.toString()),
      zNAs,
    };
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    const result = await graphQLQuery(
      this.registryGQLClient,
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
