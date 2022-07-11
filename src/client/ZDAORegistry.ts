import { ethers } from 'ethers';

import { PlatformType } from '..';
import ZDAORegistryAbi from '../config/abi/ZDAORegistry.json';
import { ZDAORegistry } from '../config/types/ZDAORegistry';
import { zNAConfig, zNAId } from '../types';
import { zDAOId, zDAOProperties, zNA } from '../types';
import { calculateGasMargin } from '../utilities';
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
  protected readonly _contract: ZDAORegistry;

  constructor(config: zNAConfig) {
    this._contract = new ethers.Contract(
      config.zDAORegistry,
      ZDAORegistryAbi.abi,
      new ethers.providers.JsonRpcProvider(config.rpcUrl, config.network)
    ) as ZDAORegistry;
  }

  async numberOfzDAOs(): Promise<number> {
    return (await this._contract.numberOfzDAOs()).toNumber();
  }

  async listZDAOs(): Promise<ZDAORecord[]> {
    const count = 100;
    let from = 0;
    let numberOfReturns = count;
    const zDAORecord: ZDAORecord[] = [];

    while (numberOfReturns === count) {
      const response = await this._contract.listZDAOs(from, count);

      // todo, collect all the promise
      for (const record of response) {
        const zNAs: string[] = [];
        const promises: Promise<zNA>[] = [];
        const zNAIds: string[] = record.associatedzNAs.map(
          (associated: ethers.BigNumber) => associated.toString()
        );
        for (const zNAId of zNAIds) {
          promises.push(
            ZNAClient.zNAIdTozNA(ethers.BigNumber.from(zNAId).toHexString())
          );
        }
        const result: zNA[] = await Promise.all(promises);
        zNAs.push(...result);

        zDAORecord.push({
          platformType: record.platformType.toNumber() as PlatformType,
          id: record.id.toString(),
          zDAOOwnedBy: record.zDAOOwnedBy,
          gnosisSafe: record.gnosisSafe,
          name: record.name,
          destroyed: false,
          associatedzNAs: zNAs,
        });
      }
      numberOfReturns = response.length;
      from += response.length;
    }
    return zDAORecord;
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const zDAORecord = await this._contract.getZDAOByZNA(
      ZNAClient.zNATozNAId(zNA)
    );

    // resolve all the zNAIds
    const promises: Promise<zNAId>[] = [];
    for (const zNAId of zDAORecord.associatedzNAs) {
      promises.push(ZNAClient.zNAIdTozNA(zNAId.toHexString()));
    }
    const zNAs: zNA[] = await Promise.all(promises);

    return {
      platformType: zDAORecord.platformType.toNumber() as PlatformType,
      id: zDAORecord.id.toString(),
      zDAOOwnedBy: zDAORecord.zDAOOwnedBy,
      gnosisSafe: zDAORecord.gnosisSafe,
      name: zDAORecord.name,
      destroyed: false,
      associatedzNAs: zNAs,
    };
  }

  async getZDAORecordById(zDAOId: zDAOId): Promise<ZDAORecord> {
    const zDAORecord = await this._contract.getZDAOById(zDAOId);

    // resolve all the zNAIds
    const promises: Promise<zNAId>[] = [];
    for (const zNAId of zDAORecord.associatedzNAs) {
      promises.push(ZNAClient.zNAIdTozNA(zNAId.toHexString()));
    }
    const zNAs: zNA[] = await Promise.all(promises);

    return {
      platformType: zDAORecord.platformType.toNumber() as PlatformType,
      id: zDAORecord.id.toString(),
      zDAOOwnedBy: zDAORecord.zDAOOwnedBy,
      gnosisSafe: zDAORecord.gnosisSafe,
      name: zDAORecord.name,
      destroyed: false,
      associatedzNAs: zNAs,
    };
  }

  doesZDAOExistForZNA(zNA: zNA): Promise<boolean> {
    return this._contract.doesZDAOExistForZNA(ZNAClient.zNATozNAId(zNA));
  }

  async addNewZDAO(
    signer: ethers.Signer,
    platformType: PlatformType,
    zNA: zNA,
    gnosisSafe: string,
    name: string,
    options?: string
  ) {
    const gasEstimated = await this._contract
      .connect(signer)
      .estimateGas.addNewZDAO(
        platformType,
        zNA,
        gnosisSafe,
        name,
        options ?? '0x00'
      );

    const tx = await this._contract
      .connect(signer)
      .addNewZDAO(platformType, zNA, gnosisSafe, name, options ?? '0x00', {
        gasLimit: calculateGasMargin(gasEstimated),
      });
    return await tx.wait();
  }

  async removeNewZDAO(signer: ethers.Signer, zDAOId: zDAOId) {
    const gasEstimated = await this._contract
      .connect(signer)
      .estimateGas.adminRemoveZDAO(zDAOId);

    const tx = await this._contract.connect(signer).adminRemoveZDAO(zDAOId, {
      gasLimit: calculateGasMargin(gasEstimated),
    });
    return await tx.wait();
  }
}

export default ZDAORegistryClient;
