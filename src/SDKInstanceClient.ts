import shortid from 'shortid';

import DAOClient from './client/DAOClient';
import SnapshotClient from './snapshot-io';
import { SnapshotSpace } from './snapshot-io/types';
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

  async listZDAOs(): Promise<zNA[]> {
    return await this._zDAORegistryClient.listZDAOs();
  }

  async getZDAOByZNA(zNA: zNA): Promise<zDAO> {
    // check if zDAO exists
    if (!(await this.doesZDAOExist(zNA))) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    // load all the spaces
    const spaces: SnapshotSpace[] = await this._snapshotClient.listSpaces(
      this._config.snapshot.network
    );

    // get zDAO information associated with zNA
    const zDAORecord: ZDAORecord =
      await this._zDAORegistryClient.getZDAORecordByZNA(zNA);

    // should be found by ens in snapshot
    const space = spaces.find((space) => space.id === zDAORecord.ens);
    if (!space) {
      throw new Error(errorMessageForError('not-found-ens-in-snapshot'));
    }

    // strategy is used to check if voter holds minimum token amount
    const strategy = space.strategies.find(
      (strategy) => !strategy.params.address && !strategy.params.decimals
    );
    if (!strategy) {
      throw new Error(errorMessageForError('not-found-strategy-in-snapshot'));
    }

    return new DAOClient(this._config, {
      id: zDAORecord.id,
      ens: zDAORecord.ens,
      zNA,
      title: space.name,
      creator: space.admins.length > 0 ? space.admins[0] : zDAORecord.ens,
      avatar: space.avatar,
      network: space.network,
      safeAddress: zDAORecord.gnosisSafe,
      votingToken: strategy.params.address,
    });
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return await this._zDAORegistryClient.doesZDAOExist(zNA);
  }

  async createZDAOFromParams(param: CreateZDAOParams) {
    if (await this.doesZDAOExist(param.zNA)) {
      throw Error(errorMessageForError('already-exist-zdao'));
    }
    if (param.title.length < 1) {
      throw Error(errorMessageForError('empty-zdao-title'));
    }
    if (param.safeAddress.length < 1) {
      throw Error(errorMessageForError('empty-gnosis-address'));
    }
    if (param.votingToken.length < 1) {
      throw Error(errorMessageForError('empty-voting-token'));
    }

    this._params.push(param);
  }

  getZDAOFromParams(zNA: zNA): Promise<zDAO> {
    const found = this._params.find(
      (param: CreateZDAOParams) => param.zNA === zNA
    );
    if (!found) {
      throw Error(errorMessageForError('not-found-zdao'));
    }
    return Promise.resolve(
      new DAOClient(this._config, {
        id: shortid.generate(),
        ens: found.ens,
        zNA: found.zNA,
        title: found.title,
        creator: found.creator,
        avatar: found.avatar,
        network: found.network.toString(),
        safeAddress: found.safeAddress,
        votingToken: found.votingToken,
      })
    );
  }
}

export default SDKInstanceClient;
