import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { BigNumber, Wallet } from 'ethers';

import DAOClient from './client/DAOClient';
import MockDAOClient from './client/MockDAOClient';
import ZNAClient from './client/ZNAClient';
import { EtherZDAOChefClient } from './ethereum';
import { ZDAORecord } from './ethereum/types';
import { Config, CreateZDAOParams, SDKInstance, zDAO, zNA } from './types';
import {
  FailedTxError,
  InvalidError,
  NotFoundError,
  ZDAOError,
} from './types/error';
import { errorMessageForError } from './utilities/messages';

class SDKInstanceClient implements SDKInstance {
  private readonly _config: Config;
  protected _etherZDAOChef!: EtherZDAOChefClient;
  protected _mockZDAOClients: MockDAOClient[] = [];

  constructor(config: Config) {
    this._config = config;
    this._etherZDAOChef = new EtherZDAOChefClient(config.ethereum);

    ZNAClient.initialize(this._config.zNS);
  }

  async createZDAO(signer: Wallet, params: CreateZDAOParams): Promise<void> {
    try {
      await this._etherZDAOChef.addNewDAO(signer, params);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async deleteZDAO(signer: Wallet, zDAOId: string): Promise<void> {
    try {
      await this._etherZDAOChef.removeDAO(signer, zDAOId);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async listZNAs(): Promise<zNA[]> {
    const zDAORecords = await this._etherZDAOChef.listzDAOs();

    // collect all the associated zNAs
    const zNAs: zNA[] = [];
    for (const zDAORecord of zDAORecords) {
      zNAs.push(...zDAORecord.zNAs);
    }

    // remove duplicated entries
    return zNAs.filter((value, index) => zNAs.indexOf(value) === index);
  }

  async listZDAOs(): Promise<zDAO[]> {
    const zDAORecords: ZDAORecord[] = await this._etherZDAOChef.listzDAOs();

    const zDAOs: zDAO[] = [];
    for (const zDAORecord of zDAORecords) {
      zDAOs.push(await DAOClient.createInstance(this._config, zDAORecord.id));
    }

    return zDAOs;
  }

  async getZDAOByZNA(zNA: zNA): Promise<zDAO> {
    // check if zDAO exists
    if (!(await this.doesZDAOExist(zNA))) {
      throw new NotFoundError(errorMessageForError('not-found-zdao'));
    }

    return await DAOClient.createInstance(this._config, zNA);
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return await this._etherZDAOChef.doeszDAOExistForzNA(zNA);
  }

  async createZDAOFromParams(params: CreateZDAOParams): Promise<zDAO> {
    if (params.title.length < 1) {
      throw new InvalidError(errorMessageForError('empty-zdao-title'));
    }
    if (params.createdBy.length < 1) {
      throw new InvalidError(errorMessageForError('empty-zdao-creator'));
    }
    if (params.gnosisSafe.length < 1) {
      throw new InvalidError(errorMessageForError('empty-gnosis-address'));
    }
    if (params.token.length < 1) {
      throw new InvalidError(errorMessageForError('empty-proposal-token'));
    }
    if (
      !isBigNumberish(params.amount) ||
      BigNumber.from(params.amount).eq(BigNumber.from(0))
    ) {
      throw new InvalidError(
        errorMessageForError('invalid-proposal-token-amount')
      );
    }
    if (
      !isBigNumberish(params.quorumVotes) ||
      BigNumber.from(params.amount).eq(BigNumber.from(0))
    ) {
      throw new InvalidError(errorMessageForError('invalid-quorum-amount'));
    }

    const exist = await this.doesZDAOExistFromParams(params.zNA);
    if (exist) {
      throw new ZDAOError(errorMessageForError('already-exist-zdao'));
    }

    const zDAOClient = await MockDAOClient.createInstance(this._config, params);

    this._mockZDAOClients.push(zDAOClient);
    return zDAOClient;
  }

  listZNAsFromParams(): Promise<zNA[]> {
    // collect all the associated zNAs
    const zNAs: zNA[] = this._mockZDAOClients.reduce(
      (prev, current) => [...prev, ...current.zNAs],
      [] as string[]
    );

    // remove duplicated entries
    return Promise.resolve(
      zNAs.filter((value, index) => zNAs.indexOf(value) === index)
    );
  }

  getZDAOByZNAFromParams(zNA: zNA): Promise<zDAO> {
    if (!this.doesZDAOExistFromParams(zNA)) {
      throw new NotFoundError(errorMessageForError('not-found-zdao'));
    }

    const found = this._mockZDAOClients.find((client) =>
      client.zNAs.find((item: zNA) => item === zNA)
    );
    if (!found) throw new NotFoundError(errorMessageForError('not-found-zdao'));

    return Promise.resolve(found);
  }

  async doesZDAOExistFromParams(zNA: zNA): Promise<boolean> {
    const zNAs = await this.listZNAsFromParams();
    const found = zNAs.find((item: zNA) => item === zNA);
    return Promise.resolve(found ? true : false);
  }
}

export default SDKInstanceClient;
