import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { ethers } from 'ethers';

import { IPFSClient, ZNAClient } from '../client';
import ZDAORegistryClient from '../client/ZDAORegistry';
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
import {
  DAOClient,
  MockDAOClient,
  ProofClient,
  RegistryClient,
  StakingClient,
} from './client';
import GlobalClient from './client/GlobalClient';
import { EthereumZDAOChefClient } from './ethereum';
import { PolygonZDAOChefClient } from './polygon';
import {
  CreatePolygonZDAOParams,
  PolygonConfig,
  PolygonSDKInstance,
  PolygonZDAO,
} from './types';

class SDKInstanceClient implements PolygonSDKInstance {
  private readonly _config: PolygonConfig;
  protected _mockZDAOClients: PolygonZDAO[] = [];

  constructor(config: PolygonConfig) {
    this._config = config;

    IPFSClient.initialize(this._config.fleek);
    ZNAClient.initialize(this._config.zNS);
    ZNSHubClient.initialize(config.zNA);

    GlobalClient.etherRpcProvider = new ethers.providers.JsonRpcProvider(
      this._config.ethereum.rpcUrl,
      this._config.ethereum.network
    );
    GlobalClient.polyRpcProvider = new ethers.providers.JsonRpcProvider(
      this._config.polygon.rpcUrl,
      this._config.polygon.network
    );
    GlobalClient.zDAORegistry = new ZDAORegistryClient(config.zNA);
    GlobalClient.ipfsGateway = config.ipfsGateway;

    return (async (config: PolygonConfig): Promise<SDKInstanceClient> => {
      GlobalClient.ethereumZDAOChef = await new EthereumZDAOChefClient(
        config.ethereum
      );
      GlobalClient.polygonZDAOChef = new PolygonZDAOChefClient(config.polygon);

      const stakingProperties =
        await GlobalClient.polygonZDAOChef.getStakingProperties();
      GlobalClient.staking = new StakingClient(stakingProperties);

      const registryAddress =
        await GlobalClient.polygonZDAOChef.getRegistryAddress();
      GlobalClient.registry = new RegistryClient(registryAddress);
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
      promises.push(DAOClient.createInstance(this._config, zDAORecord.id));
    }

    return await Promise.all(promises);
  }

  async getZDAOByZNA(zNA: zNA): Promise<PolygonZDAO> {
    // check if zDAO exists
    if (!(await this.doesZDAOExist(zNA))) {
      throw new NotFoundError(errorMessageForError('not-found-zdao'));
    }

    const zDAORecord = await GlobalClient.zDAORegistry.getZDAORecordByZNA(zNA);
    return await DAOClient.createInstance(this._config, zDAORecord.id);
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

  getZDAOByZNAFromParams(zNA: zNA): Promise<PolygonZDAO> {
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
