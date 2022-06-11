import {
  Config as zNSConfig,
  createInstance as createZNSInstance,
  Domain,
  Instance as zNSInstance,
} from '@zero-tech/zns-sdk';
import * as zns from '@zero-tech/zns-sdk';
import { ethers } from 'ethers';
import { gql, GraphQLClient } from 'graphql-request';

import { zNA, zNAId } from '../../types';
import zDAORegistry from '../config/abi/zDAORegistry.json';
import { ZDAORegistry } from '../config/types/ZDAORegistry';
import { ENS, ENSId, zNAConfig } from '../types';
import { errorMessageForError } from '../utilities/messages';
import { ZDAORecord } from './types';

class zDAORegistryClient {
  private readonly _config: zNAConfig;
  protected readonly _contract: ZDAORegistry;
  private readonly _znsInstance: zNSInstance;
  private readonly _ensGraphQLClient;

  constructor(config: zNAConfig, zNSConfig: zNSConfig) {
    this._config = config;
    this._contract = new ethers.Contract(
      config.contract,
      zDAORegistry,
      config.provider
    ) as ZDAORegistry;
    this._znsInstance = createZNSInstance(zNSConfig);
    this._ensGraphQLClient = new GraphQLClient(
      'https://api.thegraph.com/subgraphs/name/ensdomains/ens'
    );
  }

  private async zNAIdTozNA(zNAId: zNAId): Promise<zNA> {
    return this._znsInstance
      .getDomainById(zNAId)
      .then((domain: Domain) => domain.name);
  }

  private zNATozNAId(zNA: zNA): zNAId {
    return zns.domains.domainNameToId(zNA);
  }

  private async ensIdToENS(ensId: ENSId): Promise<ENS> {
    try {
      const result = await this._ensGraphQLClient.request(
        gql`
          query domains($labelhash: String!) {
            domains(first: 5, where: { labelhash: $labelhash }) {
              id
              name
              labelName
              labelhash
            }
          }
        `,
        {
          labelhash: ensId,
        }
      );
      return result.domains[0].name;
    } catch (err) {
      console.log(err);
      throw new Error(errorMessageForError('invalid-ens'));
    }
  }

  async listZNAs(): Promise<zNA[]> {
    const count = (await this._contract.numberOfzDAOs()).toNumber();
    const limit = 100;
    let from = 1;
    let numberOfReturns = limit;
    const zNAs: string[] = [];

    while (numberOfReturns === limit) {
      const response = await this._contract.listzDAOs(
        from,
        from + Math.min(limit, count) - 1
      );

      const promises: Promise<zNAId>[] = [];
      for (const record of response) {
        const zNAIds: string[] = record.associatedzNAs.map(
          (associated: ethers.BigNumber) => associated.toString()
        );
        for (const zNAId of zNAIds) {
          promises.push(
            this.zNAIdTozNA(ethers.BigNumber.from(zNAId).toHexString())
          );
        }
      }
      const result: zNAId[] = await Promise.all(promises);
      zNAs.push(...result);
      numberOfReturns = response.length;
      from += response.length;
    }
    return zNAs;
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const zDAORecord = await this._contract.getzDaoByZNA(this.zNATozNAId(zNA));

    // resolve all the zNAIds
    const promises: Promise<zNAId>[] = [];
    for (const zNAId of zDAORecord.associatedzNAs) {
      promises.push(this.zNAIdTozNA(zNAId.toHexString()));
    }
    const zNAs: zNA[] = await Promise.all(promises);

    return {
      id: zDAORecord.id.toString(),
      ens: zDAORecord.ensSpace,
      gnosisSafe: zDAORecord.gnosisSafe.toString(),
      zNAs,
    };
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return this._contract.doeszDAOExistForzNA(this.zNATozNAId(zNA));
  }
}

export default zDAORegistryClient;
