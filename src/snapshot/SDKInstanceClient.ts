import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { ethers } from 'ethers';

import { IPFSClient, ZNAClient } from '../client';
import ZDAORegistryClient, { ZDAORecord } from '../client/ZDAORegistry';
import ZNSHubClient from '../client/ZNSHubClient';
import {
  AlreadyExistError,
  FailedTxError,
  InvalidError,
  NotFoundError,
  zDAOId,
  zDAOState,
  zNA,
  zNAId,
} from '../types';
import { errorMessageForError, getSigner } from '../utilities';
import DAOClient from './client/DAOClient';
import GlobalClient from './client/GlobalClient';
import MockDAOClient from './client/MockDAOClient';
import { EthereumZDAOChefClient } from './ethereum';
import { SnapshotClient } from './snapshot';
import {
  CreateSnapshotZDAOParams,
  SnapshotConfig,
  SnapshotSDKInstance,
  SnapshotZDAO,
} from './types';

class SDKInstanceClient implements SnapshotSDKInstance {
  private readonly _config: SnapshotConfig;
  private readonly _snapshotClient: SnapshotClient;
  protected _mockZDAOClients: SnapshotZDAO[] = [];

  constructor(config: SnapshotConfig) {
    this._config = config;
    this._snapshotClient = new SnapshotClient(config.snapshot);

    IPFSClient.initialize(this._config.fleek);
    ZNAClient.initialize(this._config.zNS);
    ZNSHubClient.initialize(config.zNA);

    GlobalClient.etherRpcProvider = new ethers.providers.JsonRpcProvider(
      this._config.ethereum.rpcUrl,
      this._config.ethereum.network
    );
    GlobalClient.zDAORegistry = new ZDAORegistryClient(config.zNA);
    GlobalClient.ethereumZDAOChef = new EthereumZDAOChefClient(config.ethereum);
    GlobalClient.ipfsGateway = config.ipfsGateway;
  }

  async createZDAO(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreateSnapshotZDAOParams
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

  async listZDAOs(): Promise<SnapshotZDAO[]> {
    const zNAs = await this.listZNAs();

    const promises: Promise<SnapshotZDAO>[] = zNAs.map((zNA) =>
      this.getZDAOByZNA(zNA)
    );
    return await Promise.all(promises);
  }

  async getZDAOByZNA(zNA: zNA): Promise<SnapshotZDAO> {
    // check if zDAO exists
    if (!(await this.doesZDAOExist(zNA))) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    // get zDAO information associated with zNA
    const zDAORecord: ZDAORecord =
      await GlobalClient.zDAORegistry.getZDAORecordByZNA(zNA);

    const zDAOInfo = await GlobalClient.ethereumZDAOChef.getZDAOPropertiesById(
      zDAORecord.id
    );

    // should be found by ens in snapshot
    const space = await this._snapshotClient.getSpaceDetails(zDAOInfo.ensSpace);
    if (!space) {
      throw new Error(errorMessageForError('not-found-ens-in-snapshot'));
    }

    // strategy is used to check if voter holds minimum token amount
    const strategy = space.strategies.find(
      (strategy) =>
        strategy.name.startsWith('erc20') || strategy.name.startsWith('erc721')
    );
    if (!strategy) {
      throw new Error(errorMessageForError('not-found-strategy-in-snapshot'));
    }

    const symbol = strategy.params.symbol;
    const decimals = strategy.params.decimals ?? 0;

    return await DAOClient.createInstance(
      this._config,
      {
        id: zDAORecord.id,
        zNAs: zDAORecord.associatedzNAs,
        name: space.name,
        createdBy: '',
        network: Number(space.network),
        gnosisSafe: zDAORecord.gnosisSafe,
        votingToken: {
          token: strategy.params.address,
          symbol,
          decimals,
        },
        amount: '0',
        duration: space.duration ? Number(space.duration) : 0,
        votingThreshold: 5001,
        minimumVotingParticipants: 0,
        minimumTotalVotingTokens: ethers.BigNumber.from(10)
          .pow(ethers.BigNumber.from(decimals))
          .toString(),
        isRelativeMajority: false,
        state: zDAOState.ACTIVE,
        snapshot: 0,
        destroyed: false,
        ens: space.id,
      },
      {
        strategies: space.strategies,
      }
    );
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return await GlobalClient.zDAORegistry.doesZDAOExistForZNA(zNA);
  }

  async createZDAOFromParams(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreateSnapshotZDAOParams
  ): Promise<SnapshotZDAO> {
    if (params.name.length < 1) {
      throw new Error(errorMessageForError('empty-zdao-name'));
    }
    if (params.gnosisSafe.length < 1) {
      throw new Error(errorMessageForError('empty-gnosis-address'));
    }
    if (params.token.length < 1) {
      throw new Error(errorMessageForError('empty-proposal-token'));
    }
    if (
      !isBigNumberish(params.amount) ||
      ethers.BigNumber.from(params.amount).eq(ethers.BigNumber.from(0))
    ) {
      throw new InvalidError(
        errorMessageForError('invalid-proposal-token-amount')
      );
    }
    if (!params.ens) {
      throw new InvalidError(errorMessageForError('empty-ens'));
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

  async getZDAOByZNAFromParams(zNA: zNA): Promise<SnapshotZDAO> {
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
