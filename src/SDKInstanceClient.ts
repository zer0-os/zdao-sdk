import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { BigNumber, Signer } from 'ethers';

import DAOClient from './client/DAOClient';
import IPFSClient from './client/IPFSClient';
import MockDAOClient from './client/MockDAOClient';
import ProofClient from './client/ProofClient';
import ZNAClient from './client/ZNAClient';
import { EtherZDAOChefClient } from './ethereum';
import {
  Config,
  CreateZDAOParams,
  SDKInstance,
  zDAO,
  zNA,
  zNAId,
} from './types';
import {
  AlreadyExistError,
  FailedTxError,
  InvalidError,
  NotFoundError,
} from './types/error';
import { errorMessageForError } from './utilities/messages';

class SDKInstanceClient implements SDKInstance {
  private readonly _config: Config;
  protected _etherZDAOChef!: EtherZDAOChefClient;
  protected _mockZDAOClients: MockDAOClient[] = [];

  constructor(config: Config) {
    this._config = config;

    ZNAClient.initialize(this._config.zNS);
    IPFSClient.initialize(this._config.fleek);

    return (async (config: Config): Promise<SDKInstanceClient> => {
      this._etherZDAOChef = await new EtherZDAOChefClient(config.ethereum);
      await ProofClient.initialize(config);

      return this;
    })(config) as unknown as SDKInstanceClient;
  }

  async createZDAO(signer: Signer, params: CreateZDAOParams): Promise<void> {
    if (await this.doesZDAOExist(params.zNA)) {
      throw new AlreadyExistError(errorMessageForError('already-exist-zdao'));
    }

    try {
      const zNAId: zNAId = ZNAClient.zNATozNAId(params.zNA);
      await this._etherZDAOChef.addNewDAO(signer, {
        ...params,
        zNA: zNAId,
      });
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async deleteZDAO(signer: Signer, zDAOId: string): Promise<void> {
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
    const zNAs: zNA[] = await this.listZNAs();

    const zDAOs: zDAO[] = [];
    for (const zNA of zNAs) {
      zDAOs.push(await DAOClient.createInstance(this._config, zNA));
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

  async createZDAOFromParams(
    signer: Signer,
    params: CreateZDAOParams
  ): Promise<zDAO> {
    if (params.title.length < 1) {
      throw new InvalidError(errorMessageForError('empty-zdao-title'));
    }
    // if (params.createdBy.length < 1) {
    //   throw new InvalidError(errorMessageForError('empty-zdao-creator'));
    // }
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
      throw new AlreadyExistError(errorMessageForError('already-exist-zdao'));
    }

    const zDAOClient = await MockDAOClient.createInstance(
      this._config,
      signer,
      params
    );

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
