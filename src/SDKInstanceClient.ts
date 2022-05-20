import shortid from 'shortid';

import DAOClient from './client/DAOClient';
import SnapshotClient from './snapshot-io';
import { Config, CreateZDAOParams, SDKInstance, zDAO, zNA } from './types';
import { errorMessageForError } from './utilities/messages';
import zDAORegistryClient from './zDAORegistry';
import { ZDAORecord } from './zDAORegistry/types';

class SDKInstanceClient implements SDKInstance {
  private readonly _config: Config;
  private readonly _zDAORegistryClient: zDAORegistryClient;
  private readonly _snapshotClient: SnapshotClient;
  protected _params: CreateZDAOParams[];

  constructor(config: Config) {
    this._config = config;
    this._zDAORegistryClient = new zDAORegistryClient(config.zNA, config.zNS);
    this._snapshotClient = new SnapshotClient(config.snapshot);
    this._params = [];
  }

  async listZNAs(): Promise<zNA[]> {
    return await this._zDAORegistryClient.listZNAs();
  }

  async getZDAOByZNA(zNA: zNA): Promise<zDAO> {
    // check if zDAO exists
    if (!(await this.doesZDAOExist(zNA))) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    // get zDAO information associated with zNA
    const zDAORecord: ZDAORecord =
      await this._zDAORegistryClient.getZDAORecordByZNA(zNA);

    // should be found by ens in snapshot
    const space = await this._snapshotClient.getSpaceDetails(zDAORecord.ens);
    if (!space) {
      throw new Error(errorMessageForError('not-found-ens-in-snapshot'));
    }

    // strategy is used to check if voter holds minimum token amount
    const strategy = space.strategies.find(
      (strategy) => strategy.params.address && strategy.params.decimals
    );
    if (!strategy) {
      throw new Error(errorMessageForError('not-found-strategy-in-snapshot'));
    }

    return new DAOClient(this._config, {
      id: zDAORecord.id,
      ens: zDAORecord.ens,
      zNAs: zDAORecord.zNAs,
      title: space.name,
      creator: space.admins.length > 0 ? space.admins[0] : zDAORecord.ens,
      avatar: space.avatar,
      network: space.network,
      duration: space.duration,
      safeAddress: zDAORecord.gnosisSafe,
      votingToken: strategy.params.address,
    });
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return await this._zDAORegistryClient.doesZDAOExist(zNA);
  }

  async createZDAOFromParams(param: CreateZDAOParams): Promise<zDAO> {
    const found = this._params.find(
      (item: CreateZDAOParams) => item.zNA === param.zNA
    );
    if (found) {
      throw new Error(errorMessageForError('already-exist-zdao'));
    }
    if (param.title.length < 1) {
      throw new Error(errorMessageForError('empty-zdao-title'));
    }
    if (param.safeAddress.length < 1) {
      throw new Error(errorMessageForError('empty-gnosis-address'));
    }
    if (param.votingToken.length < 1) {
      throw new Error(errorMessageForError('empty-voting-token'));
    }

    this._params.push(param);

    return Promise.resolve(
      new DAOClient(this._config, {
        id: shortid.generate(),
        ens: param.ens,
        zNAs: [param.zNA],
        title: param.title,
        creator: param.creator,
        avatar: param.avatar,
        network: param.network.toString(),
        duration: param.duration,
        safeAddress: param.safeAddress,
        votingToken: param.votingToken,
      })
    );
  }

  listZNAsFromParams(): Promise<zNA[]> {
    return Promise.resolve(this._params.map((param) => param.zNA));
  }

  getZDAOByZNAFromParams(zNA: zNA): Promise<zDAO> {
    if (!this.doesZDAOExist(zNA)) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    const found = this._params.find((param) => param.zNA === zNA);
    if (!found) throw new Error(errorMessageForError('not-found-zdao'));

    return Promise.resolve(
      new DAOClient(this._config, {
        id: shortid.generate(),
        ens: found.ens,
        zNAs: [found.zNA],
        title: found.title,
        creator: found.creator,
        avatar: found.avatar,
        network: found.network.toString(),
        duration: found.duration,
        safeAddress: found.safeAddress,
        votingToken: found.votingToken,
      })
    );
  }

  doesZDAOExistFromParams(zNA: zNA): Promise<boolean> {
    const found = this._params.find((param) => param.zNA === zNA);
    return Promise.resolve(found ? true : false);
  }
}

export default SDKInstanceClient;
