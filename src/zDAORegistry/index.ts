import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { Provider } from '@ethersproject/providers';
import { GraphQLClient } from 'graphql-request';
import { getZNAs } from '../events/getZNAs';

import ZNAClient from '../client/ZNAClient';
import { ZDAORegistry__factory } from '../config/types/factories/ZDAORegistry__factory';
import { ZDAORegistry } from '../config/types/ZDAORegistry';
import { zNA, zNAConfig } from '../types';
import { ZDAORecord } from './types';

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
    const znaassociations = await getZNAs(this.contract);
    const promises: Promise<zNA>[] = znaassociations.map((zNA) =>
      ZNAClient.zNAIdTozNA(BigNumber.from(zNA.id).toHexString())
    );
    return await Promise.all(promises);
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const znaId = await ZNAClient.zNATozNAId(zNA);
    const zDAORecord = await this.contract.getzDaoByZNA(znaId);
    const zNAs: zNA[] = await Promise.all(
      zDAORecord.associatedzNAs.map((association) =>
        ZNAClient.zNAIdTozNA(BigNumber.from(association).toHexString())
      )
    );
    return {
      id: zDAORecord.id.toString(),
      ens: zDAORecord.ensSpace,
      safeGlobal: getAddress(zDAORecord.gnosisSafe.toString()),
      zNAs,
    }
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    const znaId = await ZNAClient.zNATozNAId(zNA);
    return await this.contract.doeszDAOExistForzNA(znaId);
  }
}

export default zDAORegistryClient;
