import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { ethers } from 'ethers';

import { IPFSClient, ZNAClient } from '../client';
import ZNSHubClient from '../client/ZNSHubClient';
import {
  AlreadyExistError,
  FailedTxError,
  InvalidError,
  NotFoundError,
  zDAOId,
  zNA,
  zNAId,
} from '../types';
import { errorMessageForError, getSigner } from '../utilities';
import { DAOClient, MockDAOClient, ProofClient } from './client';
import GlobalClient from './client/GlobalClient';
import {
  CreatePolygonZDAOParams,
  PolygonConfig,
  PolygonSDKInstance,
  PolygonZDAO,
} from './types';

class SDKInstanceClient implements PolygonSDKInstance {
  private readonly config: PolygonConfig;
  protected mockZDAOClients: PolygonZDAO[] = [];

  constructor(config: PolygonConfig) {
    this.config = config;

    IPFSClient.initialize(this.config.fleek);
    ZNAClient.initialize(this.config.zNS);
    ZNSHubClient.initialize(this.config.zNA);
    GlobalClient.initialize(this.config);

    return (async (config: PolygonConfig): Promise<SDKInstanceClient> => {
      await ProofClient.initialize(config);
      return this;
    })(config) as unknown as SDKInstanceClient;
  }

  get staking() {
    return GlobalClient.staking;
  }

  get registry() {
    return GlobalClient.registry;
  }

  async createZDAO(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreatePolygonZDAOParams
  ): Promise<void> {
    if (await this.doesZDAOExist(params.zNA)) {
      throw new AlreadyExistError(errorMessageForError('already-exist-zdao'));
    }
    if (!params.duration) {
      throw new Error(errorMessageForError('invalid-zdao-duration'));
    }

    try {
      const signer = getSigner(provider, account);
      const zNAId: zNAId = ZNAClient.zNATozNAId(params.zNA);

      // signer should be owner of zNA
      const signerAccount = account ?? (await signer.getAddress());
      if (!(await ZNSHubClient.isOwnerOf(zNAId, signerAccount))) {
        throw new InvalidError(errorMessageForError('not-zna-owner'));
      }

      await GlobalClient.ethereumZDAOChef.addNewDAO(signer, {
        ...params,
        zNA: zNAId,
      });
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async deleteZDAO(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    zDAOId: zDAOId
  ): Promise<void> {
    try {
      const signer = getSigner(provider, account);
      await GlobalClient.ethereumZDAOChef.removeDAO(signer, zDAOId);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async listZNAs(): Promise<zNA[]> {
    const zDAORecords = await GlobalClient.zDAORegistry.listZDAOs();

    // collect all the associated zNAs
    const zNAs: zNA[] = [];
    for (const zDAORecord of zDAORecords) {
      zNAs.push(...zDAORecord.associatedzNAs);
    }

    // remove duplicated entries
    return zNAs.filter((value, index) => zNAs.indexOf(value) === index);
  }

  async listZDAOs(): Promise<PolygonZDAO[]> {
    const zDAORecords = await GlobalClient.zDAORegistry.listZDAOs();

    const promises: Promise<PolygonZDAO>[] = [];
    for (const zDAORecord of zDAORecords) {
      promises.push(DAOClient.createInstance(this.config, zDAORecord));
    }

    return await Promise.all(promises);
  }

  async getZDAOByZNA(zNA: zNA): Promise<PolygonZDAO> {
    // get zDAO information associated with zNA
    const zDAORecord = await GlobalClient.zDAORegistry.getZDAORecordByZNA(zNA);

    if (zDAORecord.id === '0') {
      throw new NotFoundError(errorMessageForError('not-found-zdao'));
    }

    const instance = await DAOClient.createInstance(this.config, zDAORecord);
    return instance;
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return await GlobalClient.zDAORegistry.doesZDAOExistForZNA(zNA);
  }

  async createZDAOFromParams(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreatePolygonZDAOParams
  ): Promise<PolygonZDAO> {
    if (params.name.length < 1) {
      throw new InvalidError(errorMessageForError('empty-zdao-name'));
    }
    if (params.gnosisSafe.length < 1) {
      throw new InvalidError(errorMessageForError('empty-gnosis-address'));
    }
    if (params.token.length < 1) {
      throw new InvalidError(errorMessageForError('empty-proposal-token'));
    }
    if (
      !isBigNumberish(params.amount) ||
      ethers.BigNumber.from(params.amount).eq(ethers.BigNumber.from(0))
    ) {
      throw new InvalidError(
        errorMessageForError('invalid-proposal-token-amount')
      );
    }
    if (
      !isBigNumberish(params.minimumTotalVotingTokens) ||
      ethers.BigNumber.from(params.amount).eq(ethers.BigNumber.from(0))
    ) {
      throw new InvalidError(errorMessageForError('invalid-quorum-amount'));
    }

    const exist = await this.doesZDAOExistFromParams(params.zNA);
    if (exist) {
      throw new AlreadyExistError(errorMessageForError('already-exist-zdao'));
    }

    const signer = getSigner(provider, account);

    // const zNAId: zNAId = ZNAClient.zNATozNAId(params.zNA);

    // // signer should be owner of zNA
    // const account = account ?? (await signer.getAddress());
    // if (!(await ZNSHubClient.isOwnerOf(zNAId, account))) {
    //   throw new InvalidError(errorMessageForError('not-zna-owner'));
    // }

    const zDAOClient = await MockDAOClient.createInstance(
      this.config,
      signer,
      params
    );

    this.mockZDAOClients.push(zDAOClient);
    return zDAOClient;
  }

  listZNAsFromParams(): Promise<zNA[]> {
    // collect all the associated zNAs
    const zNAs: zNA[] = this.mockZDAOClients.reduce(
      (prev, current) => [...prev, ...current.zNAs],
      [] as string[]
    );

    // remove duplicated entries
    return Promise.resolve(
      zNAs.filter((value, index) => zNAs.indexOf(value) === index)
    );
  }

  getZDAOByZNAFromParams(zNA: zNA): Promise<PolygonZDAO> {
    if (!this.doesZDAOExistFromParams(zNA)) {
      throw new NotFoundError(errorMessageForError('not-found-zdao'));
    }

    const found = this.mockZDAOClients.find((client) =>
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
