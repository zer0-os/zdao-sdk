import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { ethers } from 'ethers';

import { PlatformType } from '..';
import { IPFSClient, ZNAClient } from '../client';
import ZNSHubClient from '../client/ZNSHubClient';
import {
  AlreadyExistError,
  InvalidError,
  NotFoundError,
  zDAOId,
  zNA,
  zNAId,
} from '../types';
import { errorMessageForError, getSigner } from '../utilities';
import DAOClient from './client/DAOClient';
import GlobalClient from './client/GlobalClient';
import MockDAOClient from './client/MockDAOClient';
import { SnapshotClient } from './snapshot';
import {
  CreateSnapshotZDAOParams,
  SnapshotConfig,
  SnapshotSDKInstance,
  SnapshotZDAO,
} from './types';

class SDKInstanceClient implements SnapshotSDKInstance {
  private readonly config: SnapshotConfig;
  private readonly snapshotClient: SnapshotClient;
  protected mockZDAOClients: SnapshotZDAO[] = [];

  constructor(config: SnapshotConfig) {
    this.config = config;
    this.snapshotClient = new SnapshotClient(config.snapshot);

    IPFSClient.initialize(this.config.fleek);
    ZNAClient.initialize(this.config.zNS);
    ZNSHubClient.initialize(this.config.zNA, config.ethereumProvider);

    return (async (config: SnapshotConfig): Promise<SDKInstanceClient> => {
      await GlobalClient.initialize(config);
      return this;
    })(config) as unknown as SDKInstanceClient;
  }

  async createZDAO(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreateSnapshotZDAOParams
  ): Promise<void> {
    if (await this.doesZDAOExist(params.zNA)) {
      throw new AlreadyExistError(errorMessageForError('already-exist-zdao'));
    }
    if (params.votingDelay) {
      throw new AlreadyExistError(
        errorMessageForError('invalid-parameter', {
          name: 'votingDelay should not be passed',
        })
      );
    }

    const signer = getSigner(provider, account);
    const zNAId: zNAId = ZNAClient.zNATozNAId(params.zNA);

    // signer should be owner of zNA
    const signerAccount = account ?? (await signer.getAddress());
    if (!(await ZNSHubClient.isOwnerOf(zNAId, signerAccount))) {
      throw new InvalidError(errorMessageForError('not-zna-owner'));
    }

    await GlobalClient.ethereumZDAOChef.addNewZDAO(signer, {
      ...params,
      zNA: zNAId,
    });
  }

  async deleteZDAO(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    zDAOId: zDAOId
  ): Promise<void> {
    const signer = getSigner(provider, account);
    await GlobalClient.ethereumZDAOChef.removeZDAO(signer, zDAOId);
  }

  async listZNAs(): Promise<zNA[]> {
    return await GlobalClient.zDAORegistry.listZNAs(PlatformType.Snapshot);
  }

  async listZDAOs(): Promise<SnapshotZDAO[]> {
    const zDAORecords = await GlobalClient.zDAORegistry.listZDAOs(
      PlatformType.Snapshot
    );

    const promises: Promise<SnapshotZDAO>[] = [];
    for (const zDAORecord of zDAORecords) {
      promises.push(DAOClient.createInstance(this.config, zDAORecord));
    }
    return await Promise.all(promises);
  }

  async getZDAOByZNA(zNA: zNA): Promise<SnapshotZDAO> {
    // get zDAO information associated with zNA
    const zDAORecord = await GlobalClient.zDAORegistry.getZDAORecordByZNA(
      PlatformType.Snapshot,
      zNA
    );
    if (!zDAORecord) {
      throw new NotFoundError(errorMessageForError('not-found-zdao'));
    }

    const instance = await DAOClient.createInstance(this.config, zDAORecord);
    return instance;
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return await GlobalClient.zDAORegistry.doesZDAOExistForZNA(
      PlatformType.Snapshot,
      zNA
    );
  }

  async createZDAOFromParams(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreateSnapshotZDAOParams
  ): Promise<SnapshotZDAO> {
    if (params.name.length < 1) {
      throw new InvalidError(errorMessageForError('empty-zdao-name'));
    }
    if (params.gnosisSafe.length < 1) {
      throw new InvalidError(errorMessageForError('empty-gnosis-address'));
    }
    if (params.votingToken.length < 1) {
      throw new InvalidError(errorMessageForError('empty-proposal-token'));
    }
    if (
      !isBigNumberish(params.minimumVotingTokenAmount) ||
      ethers.BigNumber.from(params.minimumVotingTokenAmount).eq(
        ethers.BigNumber.from(0)
      )
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

  async getZDAOByZNAFromParams(zNA: zNA): Promise<SnapshotZDAO> {
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
