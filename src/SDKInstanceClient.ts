import shortid from 'shortid';

import DAOClient from './client/DAOClient';
import { Config, CreateZDAOParams, SDKInstance, zDAO, zNA } from './types';
import { errorMessageForError } from './utilities/messages';
import zDAORegistryClient from './zDAORegistry';

class SDKInstanceClient implements SDKInstance {
  private readonly _config: Config;
  private readonly _zDAORegistryClient: zDAORegistryClient;
  protected _params: CreateZDAOParams[];

  constructor(config: Config) {
    this._config = config;
    this._zDAORegistryClient = new zDAORegistryClient(config.zNA);
    this._params = [];
  }

  listZDAOs(): Promise<zNA[]> {
    // return this._zDAORegistryClient.listZDAOs();
    return Promise.resolve(
      this._params.map((param: CreateZDAOParams) => param.zNA)
    );
  }

  getZDAOByZNA(zNA: zNA): Promise<zDAO> {
    const found = this._params.find((dao: CreateZDAOParams) => dao.zNA === zNA);
    if (!found) {
      throw Error(errorMessageForError('not-found-zdao'));
    }
    return Promise.resolve(
      new DAOClient(this._config, {
        id: shortid.generate(),
        zNA,
        title: found.title,
        creator: found.creator,
        avatar: found.avatar,
        network: found.network.toString(),
        safeAddress: found.safeAddress,
        votingToken: found.votingToken,
      })
    );
  }

  doesZDAOExist(zNA: zNA): Promise<boolean> {
    const found = this._params.find(
      (param: CreateZDAOParams) => param.zNA === zNA
    );
    return Promise.resolve(found ? true : false);
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
}

export default SDKInstanceClient;
