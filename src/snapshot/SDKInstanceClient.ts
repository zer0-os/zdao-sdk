import { ethers, Signer } from 'ethers';
import shortid from 'shortid';

import ERC1967ProxyAbi from '../config/abi/ERC1967Proxy.json';
import ZeroTokenAbi from '../config/abi/ZeroToken.json';
import {
  CreateZDAOParams,
  NotImplementedError,
  SDKInstance,
  TokenMintOptions,
  zDAO,
  zDAOId,
  zDAOState,
  zNA,
} from '../types';
import { getToken } from '../utilities/calls';
import DAOClient from './client/DAOClient';
import { SnapshotClient } from './snapshot';
import { Config, CreateZDAOParamsOptions } from './types';
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

  createZDAO(_: Signer, _2: CreateZDAOParams): Promise<void> {
    throw new NotImplementedError();
  }

  deleteZDAO(_: Signer, _2: zDAOId): Promise<void> {
    throw new NotImplementedError();
  }

  async listZNAs(): Promise<zNA[]> {
    return await this._zDAORegistryClient.listZNAs();
  }

  async listZDAOs(): Promise<zDAO[]> {
    const zNAs = await this.listZNAs();

    const promises: Promise<zDAO>[] = zNAs.map((zNA) => this.getZDAOByZNA(zNA));
    return await Promise.all(promises);
  }

  async getZDAOByZNA(zNA: zNA): Promise<zDAO> {
    // check if zDAO exists
    if (!(await this.doesZDAOExist(zNA))) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    // get zDAO information associated with zNA
    const zDAORecord: ZDAORecord =
      await this._zDAORegistryClient.getZDAORecordByZNA(zNA);

    // should be found by ens in snapshot
    const space = await this._snapshotClient.getSpaceDetails(zDAORecord.ens);
    if (!space) {
      throw new Error(errorMessageForError('not-found-ens-in-snapshot'));
    }

    // strategy is used to check if voter holds minimum token amount
    const strategy = space.strategies.find(
      (strategy) => strategy.params.address && strategy.params.decimals
    );
    if (!strategy) {
      throw new Error(errorMessageForError('not-found-strategy-in-snapshot'));
    }

    const token = await getToken(
      this._config.zNA.provider,
      strategy.params.address
    );

    const snapshot = await this._config.zNA.provider.getBlockNumber();

    return await DAOClient.createInstance(
      this._config,
      {
        id: zDAORecord.id,
        zNAs: zDAORecord.zNAs,
        title: space.name,
        createdBy: '',
        network: Number(space.network),
        gnosisSafe: zDAORecord.gnosisSafe,
        votingToken: token,
        amount: '0',
        duration: space.duration ? Number(space.duration) : 0,
        votingThreshold: 5001,
        minimumVotingParticipants: 0,
        minimumTotalVotingTokens: '0',
        isRelativeMajority: false,
        state: zDAOState.ACTIVE,
        snapshot,
        destroyed: false,
        options: {
          ens: space.id,
        },
      },
      {
        strategies: space.strategies,
      }
    );
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return await this._zDAORegistryClient.doesZDAOExist(zNA);
  }

  async createZToken(
    signer: ethers.Signer,
    name: string,
    symbol: string,
    options?: TokenMintOptions
  ): Promise<string> {
    try {
      // create implementation of zToken
      const zTokenFactory = new ethers.ContractFactory(
        ZeroTokenAbi.abi,
        ZeroTokenAbi.bytecode,
        signer
      );
      const zTokenImplementation = await zTokenFactory.deploy();
      await zTokenImplementation.deployed();

      // create ERC1967 proxy contract
      const zTokenInterface = new ethers.utils.Interface(ZeroTokenAbi.abi);
      const proxyData = zTokenInterface.encodeFunctionData('initialize', [
        name,
        symbol,
      ]);

      const proxyFactory = new ethers.ContractFactory(
        ERC1967ProxyAbi.abi,
        ERC1967ProxyAbi.bytecode,
        signer
      );

      const proxyContract = await proxyFactory.deploy(
        zTokenImplementation.address,
        proxyData
      );
      await proxyContract.deployed();

      if (options) {
        const contract = new ethers.Contract(
          proxyContract.address,
          ZeroTokenAbi.abi,
          signer.provider
        );

        // mint tokens
        await contract.connect(signer).mint(options.target, options.amount);
      }

      return proxyContract.address;
    } catch (error) {
      console.error(error);
      throw new Error(errorMessageForError('failed-create-token'));
    }
  }

  async createZDAOFromParams(
    signer: Signer,
    param: CreateZDAOParams
  ): Promise<zDAO> {
    const found = this._params.find(
      (item: CreateZDAOParams) => item.zNA === param.zNA
    );
    if (found) {
      throw new Error(errorMessageForError('already-exist-zdao'));
    }
    if (param.title.length < 1) {
      throw new Error(errorMessageForError('empty-zdao-title'));
    }
    if (param.gnosisSafe.length < 1) {
      throw new Error(errorMessageForError('empty-gnosis-address'));
    }
    if (param.token.length < 1) {
      throw new Error(errorMessageForError('empty-voting-token'));
    }

    this._params.push(param);

    const token = await getToken(this._config.zNA.provider, param.token);

    const snapshot = await this._config.zNA.provider.getBlockNumber();

    return await DAOClient.createInstance(
      this._config,
      {
        id: shortid.generate(),
        zNAs: [param.zNA],
        title: param.title,
        createdBy: '',
        network: param.network,
        gnosisSafe: param.gnosisSafe,
        votingToken: token,
        amount: '0',
        duration: param.duration,
        votingThreshold: 5001,
        minimumVotingParticipants: 0,
        minimumTotalVotingTokens: '0',
        isRelativeMajority: false,
        state: zDAOState.ACTIVE,
        snapshot,
        destroyed: false,
        options: {
          ens: (param.options as unknown as CreateZDAOParamsOptions).ens,
        },
      },
      undefined
    );
  }

  listZNAsFromParams(): Promise<zNA[]> {
    return Promise.resolve(this._params.map((param) => param.zNA));
  }

  async getZDAOByZNAFromParams(zNA: zNA): Promise<zDAO> {
    if (!this.doesZDAOExist(zNA)) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    const found = this._params.find((param) => param.zNA === zNA);
    if (!found) throw new Error(errorMessageForError('not-found-zdao'));

    const token = await getToken(this._config.zNA.provider, found.token);

    const snapshot = await this._config.zNA.provider.getBlockNumber();

    return await DAOClient.createInstance(
      this._config,
      {
        id: shortid.generate(),
        zNAs: [found.zNA],
        title: found.title,
        createdBy: '',
        network: found.network,
        gnosisSafe: found.gnosisSafe,
        votingToken: token,
        amount: '0',
        duration: found.duration,
        votingThreshold: 5001,
        minimumVotingParticipants: 0,
        minimumTotalVotingTokens: '0',
        isRelativeMajority: false,
        state: zDAOState.ACTIVE,
        snapshot,
        destroyed: false,
        options: {
          ens: (found.options as unknown as CreateZDAOParamsOptions).ens,
        },
      },
      undefined
    );
  }

  doesZDAOExistFromParams(zNA: zNA): Promise<boolean> {
    const found = this._params.find((param) => param.zNA === zNA);
    return Promise.resolve(found ? true : false);
  }
}

export default SDKInstanceClient;
