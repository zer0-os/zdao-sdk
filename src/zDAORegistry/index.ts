import { BigNumber, ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import ZNAClient from '../client/ZNAClient';
import { ZDAORegistry__factory } from '../config/types/factories/ZDAORegistry__factory';
import { ZDAORegistry } from '../config/types/ZDAORegistry';
import { zDAOId, zNA, zNAConfig, zNAId } from '../types';
import { errorMessageForError } from '../utilities';
import { graphQLQuery } from '../utilities/graphql';
import { calculateGasMargin } from '../utilities/tx';
import { ZDAORecord, ZNAASSOCIATION_BY_QUERY, ZNAS_QUERY } from './types';

class zDAORegistryClient {
  private readonly contract: ZDAORegistry;
  private readonly _registryGQLClient: GraphQLClient;

  constructor(config: zNAConfig, provider: ethers.providers.Provider) {
    this.contract = ZDAORegistry__factory.connect(
      config.zDAORegistry,
      provider
    );
    this._registryGQLClient = new GraphQLClient(config.subgraphUri);
  }

  async listZNAs(): Promise<zNA[]> {
    const result = await graphQLQuery(this._registryGQLClient, ZNAS_QUERY, {
      platformType: 0,
    });
    const promises: Promise<zNA>[] = result.znaassociations.map((zNA: any) =>
      ZNAClient.zNAIdTozNA(BigNumber.from(zNA.id).toHexString())
    );
    return await Promise.all(promises);
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const result = await graphQLQuery(
      this._registryGQLClient,
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
      gnosisSafe: ethers.utils.getAddress(zDAORecord.gnosisSafe.toString()),
      zNAs,
    };
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    const result = await graphQLQuery(
      this._registryGQLClient,
      ZNAASSOCIATION_BY_QUERY,
      {
        id_in: [ZNAClient.zNATozNAId(zNA)],
        platformType: 0,
      }
    );
    return result.znaassociations.length > 0;
  }

  async addNewZDAO(
    signer: ethers.Signer,
    zNA: zNA,
    ensSpace: string,
    gnosisSafe: string
  ) {
    try {
      const gasEstimated = await this.contract
        .connect(signer)
        .estimateGas.addNewDAO(ensSpace, gnosisSafe);

      const tx = await this.contract
        .connect(signer)
        .addNewDAO(ensSpace, gnosisSafe, {
          gasLimit: calculateGasMargin(gasEstimated),
        });
      await tx.wait();

      const lastZDAOId = await this.contract.numberOfzDAOs();

      const zNAId: zNAId = ZNAClient.zNATozNAId(zNA);
      const gasEstimated2 = await this.contract
        .connect(signer)
        .estimateGas.addZNAAssociation(lastZDAOId, zNAId);

      const tx2 = await this.contract
        .connect(signer)
        .addZNAAssociation(lastZDAOId, zNAId, {
          gasLimit: calculateGasMargin(gasEstimated2),
        });
      await tx2.wait();
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new Error(
        errorMessageForError('transaction-error', {
          message: errorMsg,
        })
      );
    }
  }

  async removeZDAO(signer: ethers.Signer, zDAOId: zDAOId) {
    try {
      const gasEstimated = await this.contract
        .connect(signer)
        .estimateGas.adminRemoveDAO(zDAOId);

      const tx = await this.contract.connect(signer).adminRemoveDAO(zDAOId, {
        gasLimit: calculateGasMargin(gasEstimated),
      });
      return await tx.wait();
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new Error(
        errorMessageForError('transaction-error', {
          message: errorMsg,
        })
      );
    }
  }
}

export default zDAORegistryClient;
