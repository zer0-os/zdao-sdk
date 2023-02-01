import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { Provider } from '@ethersproject/providers';
import { GraphQLClient } from 'graphql-request';

import ZNAClient from '../client/ZNAClient';
import { ZDAORegistry__factory } from '../config/types/factories/ZDAORegistry__factory';
import { ZDAORegistry } from '../config/types/ZDAORegistry';
import { zNA, zNAConfig } from '../types';
import { errorMessageForError } from '../utilities';
import { graphQLQuery } from '../utilities/graphql';
import { ZDAORecord, ZNAASSOCIATION_BY_QUERY, ZNAS_QUERY } from './types';

class zDAORegistryClient {
  private readonly contract: ZDAORegistry;
  private readonly registryGQLClient: GraphQLClient;

  constructor(config: zNAConfig, provider: Provider) {
    this.contract = ZDAORegistry__factory.connect(
      config.zDAORegistry,
      provider
    );
    this.registryGQLClient = new GraphQLClient(config.subgraphUri);
  }

  async listZNAs(): Promise<zNA[]> {
    const result = await graphQLQuery(this.registryGQLClient, ZNAS_QUERY, {
      platformType: 0,
    });
    const promises: Promise<zNA>[] = result.znaassociations.map((zNA: any) =>
      ZNAClient.zNAIdTozNA(BigNumber.from(zNA.id).toHexString())
    );
    return await Promise.all(promises);
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const result = await graphQLQuery(
      this.registryGQLClient,
      ZNAASSOCIATION_BY_QUERY,
      {
        id_in: [ZNAClient.zNATozNAId(zNA)],
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
        ZNAClient.zNAIdTozNA(BigNumber.from(association.id).toHexString())
      )
    );

    const zDAORecord = result.znaassociations[0].zDAORecord;
    return {
      id: zDAORecord.zDAOId.toString(),
      ens: zDAORecord.name,
      safeGlobal: getAddress(zDAORecord.gnosisSafe.toString()),
      zNAs,
    };
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    const result = await graphQLQuery(
      this.registryGQLClient,
      ZNAASSOCIATION_BY_QUERY,
      {
        id_in: [ZNAClient.zNATozNAId(zNA)],
        platformType: 0,
      }
    );
    return result.znaassociations.length > 0;
  }
}

export default zDAORegistryClient;
