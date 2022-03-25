import shortid from 'shortid';

import { Config, CreateZDAOParams, SDKInstance, zDAO, zNA } from './types';
import { t } from './utilities/messages';
import zDAOClient from './zDAOClient';
import zNAClient from './zNAClient';

class zSDKClient implements SDKInstance {
  private readonly _config: Config;
  private readonly _zNAClient: zNAClient;
  protected _params: CreateZDAOParams[];

  constructor(config: Config) {
    this._config = config;
    this._zNAClient = new zNAClient(config.zNA);
    this._params = [];
  }

  listZDAOs(): Promise<zNA[]> {
    // return this._zNAClient.listZDAOs();
    return Promise.resolve(
      this._params.map((param: CreateZDAOParams) => param.zNA)
    );
  }

  getZDAOByZNA(zNA: zNA): Promise<zDAO> {
    const found = this._params.find((dao: CreateZDAOParams) => dao.zNA === zNA);
    if (!found) {
      throw Error(t('not-found-zdao'));
    }
    return Promise.resolve(
      new zDAOClient(
        this._config,
        shortid.generate(),
        zNA,
        found.title,
        found.creator,
        found.avatar,
        found.network.toString(),
        found.safeAddress,
        found.votingToken
      )
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
      throw Error(t('already-exist-zdao'));
    }
    if (param.title.length < 1) {
      throw Error('empty-zdao-title');
    }
    if (param.safeAddress.length < 1) {
      throw Error('empty-gnosis-address');
    }
    if (param.owners.length < 1) {
      throw Error(t('empty-gnosis-owners'));
    }
    if (param.votingToken.length < 1) {
      throw Error(t('empty-voting-token'));
    }

    this._params.push(param);
  }
}

export default zSDKClient;
