import { BigNumber, ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { PlatformType } from '..';
import { ZDAORegistry__factory } from '../config/types/factories/ZDAORegistry__factory';
import { ZDAORegistry } from '../config/types/ZDAORegistry';
import { FailedTxError, NetworkError, zNAConfig } from '../types';
import { zDAOId, zDAOProperties, zNA } from '../types';
import { calculateGasMargin, graphQLQuery, validateAddress } from '../utilities';
import {
  ZDAORECORDS_QUERY,
  ZNAASSOCIATION_BY_QUERY,
  ZNAS_QUERY,
} from './types';
import ZNAClient from './ZNAClient';

export interface ZDAORecord {
  platformType: number;
  id: zDAOId;
  zDAOOwnedBy: string; // zDAO owner and created by
  gnosisSafe: string; // Gnosis safe address where collected treasuries are stored
  name: string; // zDAO name
  destroyed: boolean;
  associatedzNAs: zNA[];
}

export interface EthereumZDAOProperties extends Omit<zDAOProperties, 'state'> {
  // Address to ZDAO contract
  address: string;
}

class ZDAORegistryClient {
  protected readonly contract: ZDAORegistry;
  private readonly registryGQLClient: GraphQLClient;

  constructor(config: zNAConfig, provider: ethers.providers.Provider) {
    this.contract = ZDAORegistry__factory.connect(
      config.zDAORegistry,
      provider
    );
    this.registryGQLClient = new GraphQLClient(config.subgraphUri);
  }

  async numberOfzDAOs(): Promise<number> {
    try {
      return (await this.contract.numberOfzDAOs()).toNumber();
    } catch (error: any) {
      throw new NetworkError(error.message);
    }
  }

  async listZNAs(platformType: PlatformType): Promise<zNA[]> {
    const result = await graphQLQuery(this.registryGQLClient, ZNAS_QUERY, {
      platformType,
    });

    const promises: Promise<zNA>[] = result.znaassociations.map(
      (association: any) =>
        ZNAClient.zNAIdTozNA(BigNumber.from(association.id).toHexString())
    );
    return await Promise.all(promises);
  }

  async listZDAOs(platformType: PlatformType): Promise<ZDAORecord[]> {
    const result = await graphQLQuery(
      this.registryGQLClient,
      ZDAORECORDS_QUERY,
      {
        platformType,
      }
    );

    const promises: Promise<zNA>[] = [];
    for (const zDAORecord of result.zdaorecords) {
      promises.push(
        ...zDAORecord.zNAs.map((association: any) =>
          ZNAClient.zNAIdTozNA(BigNumber.from(association.id).toHexString())
        )
      );
    }
    const zNAs: zNA[] = await Promise.all(promises);

    return result.zdaorecords.map((record: any) => ({
      platformType: record.platformType,
      id: record.zDAOId.toString(),
      zDAOOwnedBy: validateAddress(record.createdBy.toString()),
      gnosisSafe: validateAddress(record.gnosisSafe.toString()),
      name: record.name.toString(),
      destroyed: false,
      associatedzNAs: zNAs.splice(0, record.zNAs.length),
    }));
  }

  async getZDAORecordByZNA(
    platformType: PlatformType,
    zNA: zNA
  ): Promise<ZDAORecord | undefined> {
    const result = await graphQLQuery(
      this.registryGQLClient,
      ZNAASSOCIATION_BY_QUERY,
      {
        id_in: [ZNAClient.zNATozNAId(zNA)],
        platformType,
      }
    );
    if (
      !result ||
      !Array.isArray(result.znaassociations) ||
      result.znaassociations.length < 1
    ) {
      return undefined;
    }

    const zNAs: zNA[] = await Promise.all(
      result.znaassociations[0].zDAORecord.zNAs.map((association: any) =>
        ZNAClient.zNAIdTozNA(BigNumber.from(association.id).toHexString())
      )
    );

    const zDAORecord = result.znaassociations[0].zDAORecord;
    return {
      platformType: zDAORecord.platformType,
      id: zDAORecord.zDAOId.toString(),
      zDAOOwnedBy: validateAddress(zDAORecord.createdBy.toString()),
      gnosisSafe: validateAddress(zDAORecord.gnosisSafe.toString()),
      name: zDAORecord.name.toString(),
      destroyed: false,
      associatedzNAs: zNAs,
    };
  }

  async doesZDAOExistForZNA(
    platformType: PlatformType,
    zNA: zNA
  ): Promise<boolean> {
    const result = await graphQLQuery(
      this.registryGQLClient,
      ZNAASSOCIATION_BY_QUERY,
      {
        id_in: [ZNAClient.zNATozNAId(zNA)],
        platformType,
      }
    );

    return result.znaassociations.length > 0;
  }

  async addNewZDAO(
    signer: ethers.Signer,
    platformType: PlatformType,
    zNA: zNA,
    gnosisSafe: string,
    name: string,
    options?: string
  ) {
    try {
      const gasEstimated = await this.contract
        .connect(signer)
        .estimateGas.addNewZDAO(
          platformType,
          zNA,
          gnosisSafe,
          name,
          options ?? '0x00'
        );

      const tx = await this.contract
        .connect(signer)
        .addNewZDAO(platformType, zNA, gnosisSafe, name, options ?? '0x00', {
          gasLimit: calculateGasMargin(gasEstimated),
        });
      return await tx.wait();
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async removeZDAO(signer: ethers.Signer, zDAOId: zDAOId) {
    try {
      const gasEstimated = await this.contract
        .connect(signer)
        .estimateGas.adminRemoveZDAO(zDAOId);

      const tx = await this.contract.connect(signer).adminRemoveZDAO(zDAOId, {
        gasLimit: calculateGasMargin(gasEstimated),
      });
      return await tx.wait();
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }
}

export default ZDAORegistryClient;
