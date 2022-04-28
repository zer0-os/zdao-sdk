import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { BigNumber } from 'ethers';

import DAOClient from './client/DAOClient';
import MockDAOClient from './client/MockDAOClient';
import { EtherZDAOChefClient } from './ethereum';
import { Config, CreateZDAOParams, SDKInstance, zDAO, zNA } from './types';
import { errorMessageForError } from './utilities/messages';

class SDKInstanceClient implements SDKInstance {
  private readonly _config: Config;
  protected _etherZDAOChef!: EtherZDAOChefClient;
  protected _zDAOClients: MockDAOClient[] = [];

  constructor(config: Config) {
    this._config = config;
    this._etherZDAOChef = new EtherZDAOChefClient(config.ethereum);
  }

  async listZNAs(): Promise<zNA[]> {
    const listOfzDAOs = await this._etherZDAOChef.listzDAOs();

    // collect all the associated zNAs
    const zNAs: zNA[] = [];
    for (const zDAORecord of listOfzDAOs) {
      zNAs.push(...zDAORecord.zNAs);
    }

    // remove duplicated entries
    return zNAs.filter((value, index) => zNAs.indexOf(value) === index);
  }

  async getZDAOByZNA(zNA: zNA): Promise<zDAO> {
    // check if zDAO exists
    if (!(await this.doesZDAOExist(zNA))) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    return await DAOClient.createInstance(this._config, zNA);
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return await this._etherZDAOChef.doeszDAOExistForzNA(zNA);
  }

  async createZDAOFromParams(param: CreateZDAOParams): Promise<zDAO> {
    if (param.title.length < 1) {
      throw new Error(errorMessageForError('empty-zdao-title'));
    }
    if (param.createdBy.length < 1) {
      throw new Error(errorMessageForError('empty-zdao-creator'));
    }
    if (param.gnosisSafe.length < 1) {
      throw new Error(errorMessageForError('empty-gnosis-address'));
    }
    if (param.token.length < 1) {
      throw new Error(errorMessageForError('empty-proposal-token'));
    }
    if (
      !isBigNumberish(param.amount) ||
      BigNumber.from(param.amount).eq(BigNumber.from(0))
    ) {
      throw new Error(errorMessageForError('invalid-proposal-token-amount'));
    }
    if (
      !isBigNumberish(param.quorumVotes) ||
      BigNumber.from(param.amount).eq(BigNumber.from(0))
    ) {
      throw new Error(errorMessageForError('invalid-quorum-amount'));
    }

    const exist = await this.doesZDAOExistFromParams(param.zNA);
    if (exist) {
      throw new Error(errorMessageForError('already-exist-zdao'));
    }

    const zDAOClient = await MockDAOClient.createInstance(this._config, param);

    this._zDAOClients.push(zDAOClient);
    return zDAOClient;
  }

  listZNAsFromParams(): Promise<zNA[]> {
    // collect all the associated zNAs
    const zNAs: zNA[] = this._zDAOClients.reduce(
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
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    const found = this._zDAOClients.find((client) =>
      client.zNAs.find((item: zNA) => item === zNA)
    );
    if (!found) throw new Error(errorMessageForError('not-found-zdao'));

    return Promise.resolve(found);
  }

  async doesZDAOExistFromParams(zNA: zNA): Promise<boolean> {
    const zNAs = await this.listZNAsFromParams();
    const found = zNAs.find((item: zNA) => item === zNA);
    return Promise.resolve(found ? true : false);
  }
}

export default SDKInstanceClient;
