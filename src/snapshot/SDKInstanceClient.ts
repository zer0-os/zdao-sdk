import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { BigNumber, ethers } from 'ethers';

import { IPFSClient, ZNAClient } from '../client';
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
import {
  errorMessageForError,
  getDecimalAmount,
  getSigner,
  getTotalSupply,
} from '../utilities';
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
    ZNSHubClient.initialize(this.config.zNA);
    GlobalClient.initialize(this.config);
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
          name: 'votingDelay',
        })
      );
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
    // get zDAO information associated with zNA
    const zDAORecord = await GlobalClient.zDAORegistry.getZDAORecordByZNA(zNA);

    if (zDAORecord.id === '0') {
      throw new NotFoundError(errorMessageForError('not-found-zdao'));
    }

    const zDAOInfo = await GlobalClient.ethereumZDAOChef.getZDAOPropertiesById(
      zDAORecord.id
    );

    // should be found by ens in snapshot
    const space = await this.snapshotClient.getSpaceDetails(zDAOInfo.ensSpace);
    if (!space) {
      throw new NotFoundError(
        errorMessageForError('not-found-ens-in-snapshot')
      );
    }

    // strategy is used to check if voter holds minimum token amount
    const strategy = space.strategies.find(
      (strategy) =>
        strategy.name.startsWith('erc20') || strategy.name.startsWith('erc721')
    );
    if (!strategy) {
      throw new NotFoundError(
        errorMessageForError('not-found-strategy-in-snapshot')
      );
    }

    const symbol = strategy.params.symbol;
    const decimals = strategy.params.decimals ?? 0;

    const totalSupplyOfVotingToken = await getTotalSupply(
      GlobalClient.etherRpcProvider,
      strategy.params.address
    ).catch(() => {
      throw new InvalidError(errorMessageForError('not-support-total-supply'));
    });
    const minimumTotalVotingTokens = space.quorum
      ? getDecimalAmount(
          BigNumber.from(space.quorum.toString()),
          decimals
        ).toString()
      : '0';
    const votingThreshold =
      totalSupplyOfVotingToken === BigNumber.from(0)
        ? 0
        : BigNumber.from(minimumTotalVotingTokens)
            .mul(10000)
            .div(totalSupplyOfVotingToken)
            .toNumber();

    return await DAOClient.createInstance(
      this.config,
      {
        id: zDAORecord.id,
        zNAs: zDAORecord.associatedzNAs,
        name: space.name,
        createdBy: '',
        network: Number(this.config.snapshot.network),
        gnosisSafe: zDAORecord.gnosisSafe,
        votingToken: {
          token: strategy.params.address,
          symbol,
          decimals,
        },
        amount: space.threshold
          ? getDecimalAmount(
              BigNumber.from(space.threshold.toString()),
              decimals
            ).toString()
          : '0',
        totalSupplyOfVotingToken: totalSupplyOfVotingToken.toString(),
        duration: space.duration ? Number(space.duration) : 0,
        votingDelay: space.delay ?? 0,
        votingThreshold,
        minimumVotingParticipants: 1,
        minimumTotalVotingTokens,
        isRelativeMajority: false,
        state: zDAOState.ACTIVE,
        snapshot: 0,
        destroyed: false,
        ens: space.id,
      },
      {
        delay: space.delay,
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
