import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { ethers, Signer } from 'ethers';

import { IPFSClient, ZNAClient } from '../client';
import ZDAORegistryClient, { ZDAORecord } from '../client/ZDAORegistry';
import ZNSHubClient from '../client/ZNSHubClient';
import ERC1967ProxyAbi from '../config/abi/ERC1967Proxy.json';
import ZeroTokenAbi from '../config/abi/ZeroToken.json';
import {
  AlreadyExistError,
  CreateZDAOParams,
  InvalidError,
  NotFoundError,
  NotImplementedError,
  SDKInstance,
  TokenMintOptions,
  zDAO,
  zDAOId,
  zDAOState,
  zNA,
} from '../types';
import { errorMessageForError } from '../utilities';
import { getToken } from '../utilities/calls';
import DAOClient from './client/DAOClient';
import GlobalClient from './client/GlobalClient';
import MockDAOClient from './client/MockDAOClient';
import { ZDAOChefClient } from './ethereum';
import { SnapshotClient } from './snapshot';
import { Config, CreateZDAOParamsOptions } from './types';

class SDKInstanceClient implements SDKInstance {
  private readonly _config: Config;
  private readonly _snapshotClient: SnapshotClient;
  protected _mockZDAOClients: zDAO[] = [];

  constructor(config: Config) {
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
    GlobalClient.rootZDAOChef = new ZDAOChefClient(config.ethereum);
    GlobalClient.ipfsGateway = config.ipfsGateway;
  }

  createZDAO(_: Signer, _2: CreateZDAOParams): Promise<void> {
    throw new NotImplementedError();
  }

  deleteZDAO(_: Signer, _2: zDAOId): Promise<void> {
    throw new NotImplementedError();
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
      await GlobalClient.zDAORegistry.getZDAORecordByZNA(zNA);

    const zDAOInfo = await GlobalClient.rootZDAOChef.getZDAOPropertiesById(
      zDAORecord.id
    );

    // should be found by ens in snapshot
    const space = await this._snapshotClient.getSpaceDetails(zDAOInfo.ensSpace);
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
      GlobalClient.etherRpcProvider,
      strategy.params.address
    );

    const snapshot = await GlobalClient.etherRpcProvider.getBlockNumber();

    return await DAOClient.createInstance(
      this._config,
      {
        id: zDAORecord.id,
        zNAs: zDAORecord.associatedzNAs,
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
    return await GlobalClient.zDAORegistry.doeszDAOExistForzNA(zNA);
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
    params: CreateZDAOParams
  ): Promise<zDAO> {
    if (params.title.length < 1) {
      throw new Error(errorMessageForError('empty-zdao-title'));
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
    if (!params.options) {
      throw new InvalidError(errorMessageForError('invalid-zdao-options'));
    }
    if (!(params.options as CreateZDAOParamsOptions).ens) {
      throw new InvalidError(errorMessageForError('empty-ens'));
    }

    const exist = await this.doesZDAOExistFromParams(params.zNA);
    if (exist) {
      throw new AlreadyExistError(errorMessageForError('already-exist-zdao'));
    }

    // const zNAId: zNAId = ZNAClient.zNATozNAId(params.zNA);

    // // signer should be owner of zNA
    // const account = await signer.getAddress();
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

  async getZDAOByZNAFromParams(zNA: zNA): Promise<zDAO> {
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
