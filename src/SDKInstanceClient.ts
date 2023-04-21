import { BigNumber } from '@ethersproject/bignumber';
import shortid from 'shortid';

import DAOClient from './client/DAOClient';
import ZNAClient from './client/ZNAClient';
import ZNSHubClient from './client/ZNSHubClient';
import SafeGlobalClient from './safe-global';
import { SafeGlobalAccountDetails } from './safe-global/types';
import SnapshotClient from './snapshot-io';
import { SnapshotSpaceDetails } from './snapshot-io/types';
import {
  Config,
  CreateZDAOParams,
  Maybe,
  SDKInstance,
  SupportedChainId,
  zDAO,
  zNA,
} from './types';
import { getDecimalAmount } from './utilities';
import { getToken, getTotalSupply } from './utilities/calls';
import { errorMessageForError } from './utilities/messages';
import zDAORegistryClient from './zDAORegistry';
import { ZDAORecord } from './zDAORegistry/types';

class SDKInstanceClient implements SDKInstance {
  private readonly config: Config;
  private readonly zDAORegistryClient: zDAORegistryClient;
  private readonly snapshotClient: SnapshotClient;
  private readonly safeGlobalClient: SafeGlobalClient;
  protected params: CreateZDAOParams[];

  constructor(config: Config) {
    this.config = config;
    this.zDAORegistryClient = new zDAORegistryClient(
      config.zNA,
      config.provider
    );
    this.snapshotClient = new SnapshotClient(config.snapshot);
    this.safeGlobalClient = new SafeGlobalClient();
    this.params = [];

    ZNSHubClient.initialize(config.zNA, config.provider);
    ZNAClient.initialize(config.zNS);
  }

  async listZNAs(): Promise<zNA[]> {
    return await this.zDAORegistryClient.listZNAs();
  }

  async listZDAOs(): Promise<any> {
    return await this.zDAORegistryClient.listZDAOs();
  }

  async getZDAOByZNA(zNA: zNA): Promise<zDAO> {
    // get zDAO information associated with zNA
    const zDAORecord: ZDAORecord =
      await this.zDAORegistryClient.getZDAORecordByZNA(zNA);

    // should be found by ens in snapshot
    const space = await this.snapshotClient.getSpaceDetails(zDAORecord.ens);
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

    const totalSupplyOfVotingToken = await getTotalSupply(
      this.config.provider,
      strategy.params.address
    );
    const minimumTotalVotingTokens = space.quorum
      ? getDecimalAmount(
        BigNumber.from(space.quorum.toString()),
        decimals
      ).toString()
      : '0';
    const votingThreshold = totalSupplyOfVotingToken === BigNumber.from(0)
      ? 0
      : BigNumber.from(minimumTotalVotingTokens)
        .mul(10000)
        .div(totalSupplyOfVotingToken)
        .toNumber();

    return await DAOClient.createInstance(
      this.config,
      this.snapshotClient,
      this.safeGlobalClient,
      {
        id: zDAORecord.id,
        ens: zDAORecord.ens,
        zNAs: zDAORecord.zNAs,
        title: space.name,
        creator: space.admins.length > 0 ? space.admins[0] : zDAORecord.ens,
        network: this.config.network,
        duration: space.duration,
        safeAddress: zDAORecord.safeGlobal,
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
        votingThreshold,
        minimumVotingParticipants: 1,
        minimumTotalVotingTokens,
        isRelativeMajority: false,
      },
      {
        delay: space.delay,
        strategies: space.strategies,
      }
    );
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return await this.zDAORegistryClient.doesZDAOExist(zNA);
  }

  async createZDAOFromParams(param: CreateZDAOParams): Promise<zDAO> {
    const found = this.params.find(
      (item: CreateZDAOParams) => item.zNA === param.zNA
    );
    if (found) {
      throw new Error(errorMessageForError('already-exist-zdao'));
    }
    if (param.title.length < 1) {
      throw new Error(errorMessageForError('empty-zdao-title'));
    }
    if (param.safeAddress.length < 1) {
      throw new Error(errorMessageForError('empty-safe-global-address'));
    }
    if (param.votingToken.length < 1) {
      throw new Error(errorMessageForError('empty-voting-token'));
    }

    this.params.push(param);

    const calls = await Promise.all([
      getToken(this.config.provider, param.votingToken),
      getTotalSupply(this.config.provider, param.votingToken),
    ]);

    return await DAOClient.createInstance(
      this.config,
      this.snapshotClient,
      this.safeGlobalClient,
      {
        id: shortid.generate(),
        ens: param.ens,
        zNAs: [param.zNA],
        title: param.title,
        creator: param.creator,
        network: param.network,
        duration: param.duration,
        safeAddress: param.safeAddress,
        votingToken: calls[0],
        amount: '0',
        totalSupplyOfVotingToken: calls[1].toString(),
        votingThreshold: 0,
        minimumVotingParticipants: 1,
        minimumTotalVotingTokens: '0',
        isRelativeMajority: false,
      },
      undefined
    );
  }

  listZNAsFromParams(): Promise<zNA[]> {
    return Promise.resolve(this.params.map((param) => param.zNA));
  }

  async getZDAOByZNAFromParams(zNA: zNA): Promise<zDAO> {
    if (!this.doesZDAOExist(zNA)) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    const found = this.params.find((param) => param.zNA === zNA);
    if (!found) throw new Error(errorMessageForError('not-found-zdao'));

    const calls = await Promise.all([
      getToken(this.config.provider, found.votingToken),
      getTotalSupply(this.config.provider, found.votingToken),
    ]);

    return await DAOClient.createInstance(
      this.config,
      this.snapshotClient,
      this.safeGlobalClient,
      {
        id: shortid.generate(),
        ens: found.ens,
        zNAs: [found.zNA],
        title: found.title,
        creator: found.creator,
        network: found.network,
        duration: found.duration,
        safeAddress: found.safeAddress,
        votingToken: calls[0],
        amount: '0',
        totalSupplyOfVotingToken: calls[1].toString(),
        votingThreshold: 0,
        minimumVotingParticipants: 1,
        minimumTotalVotingTokens: '0',
        isRelativeMajority: false,
      },
      undefined
    );
  }

  doesZDAOExistFromParams(zNA: zNA): Promise<boolean> {
    const found = this.params.find((param) => param.zNA === zNA);
    return Promise.resolve(found ? true : false);
  }

  get snapshot() {
    return {
      getSpaceDetails: async (
        ens: string
      ): Promise<SnapshotSpaceDetails | undefined> => {
        try {
          return await this.snapshotClient.getSpaceDetails(ens);
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === errorMessageForError('not-found-ens-in-snapshot')
          ) {
            return undefined;
          }
          throw error;
        }
      },
    };
  }

  get safeGlobal() {
    return {
      getAccountDetails: async (
        network: SupportedChainId,
        safeAddress: string
      ): Promise<Maybe<SafeGlobalAccountDetails>> => {
        return await this.safeGlobalClient.getAccountDetails(
          network,
          safeAddress
        );
      },
    };
  }
}

export default SDKInstanceClient;
