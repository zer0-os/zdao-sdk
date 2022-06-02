import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';
import { BigNumber, ethers, Signer } from 'ethers';

import {
  DAOClient,
  IPFSClient,
  MockDAOClient,
  ProofClient,
  RegistryClient,
  StakingClient,
  ZNAClient,
  ZNSHubClient,
} from './client';
import GlobalClient from './client/GlobalClient';
import ERC1967ProxyAbi from './config/abi/ERC1967Proxy.json';
import ZeroTokenAbi from './config/abi/ZeroToken.json';
import { EtherZDAOChefClient } from './ethereum';
import { PolyZDAOChefClient } from './polygon';
import {
  Config,
  CreateZDAOParams,
  SDKInstance,
  TokenMintOptions,
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
  protected _mockZDAOClients: MockDAOClient[] = [];

  constructor(config: Config) {
    this._config = config;

    ZNAClient.initialize(this._config.zNS);
    IPFSClient.initialize(this._config.fleek);

    GlobalClient.etherRpcProvider = new ethers.providers.JsonRpcProvider(
      this._config.ethereum.rpcUrl,
      this._config.ethereum.network
    );
    GlobalClient.polyRpcProvider = new ethers.providers.JsonRpcProvider(
      this._config.polygon.rpcUrl,
      this._config.polygon.network
    );

    return (async (config: Config): Promise<SDKInstanceClient> => {
      GlobalClient.etherZDAOChef = await new EtherZDAOChefClient(
        config.ethereum
      );
      GlobalClient.polyZDAOChef = new PolyZDAOChefClient(config.polygon);

      const znsHubAddress = await GlobalClient.etherZDAOChef.znsHub();
      GlobalClient.znsHub = new ZNSHubClient(znsHubAddress);

      const stakingProperties =
        await GlobalClient.polyZDAOChef.getStakingProperties();
      GlobalClient.staking = new StakingClient(stakingProperties);

      const registryAddress =
        await GlobalClient.polyZDAOChef.getRegistryAddress();
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

  async createZDAO(signer: Signer, params: CreateZDAOParams): Promise<void> {
    if (await this.doesZDAOExist(params.zNA)) {
      throw new AlreadyExistError(errorMessageForError('already-exist-zdao'));
    }

    try {
      const zNAId: zNAId = ZNAClient.zNATozNAId(params.zNA);

      // signer should be owner of zNA
      const account = await signer.getAddress();
      if (!GlobalClient.znsHub.isOwnerOf(zNAId, account)) {
        throw new InvalidError(errorMessageForError('not-zna-owner'));
      }

      await GlobalClient.etherZDAOChef.addNewDAO(signer, {
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
      await GlobalClient.etherZDAOChef.removeDAO(signer, zDAOId);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async listZNAs(): Promise<zNA[]> {
    const zDAORecords = await GlobalClient.etherZDAOChef.listzDAOs();

    // collect all the associated zNAs
    const zNAs: zNA[] = [];
    for (const zDAORecord of zDAORecords) {
      zNAs.push(...zDAORecord.zNAs);
    }

    // remove duplicated entries
    return zNAs.filter((value, index) => zNAs.indexOf(value) === index);
  }

  async listZDAOs(): Promise<zDAO[]> {
    const zDAORecords = await GlobalClient.etherZDAOChef.listzDAOs();

    const promises: Promise<zDAO>[] = [];
    for (const zDAORecord of zDAORecords) {
      promises.push(DAOClient.createInstance(this._config, zDAORecord.id));
    }

    return await Promise.all(promises);
  }

  async getZDAOByZNA(zNA: zNA): Promise<zDAO> {
    // check if zDAO exists
    if (!(await this.doesZDAOExist(zNA))) {
      throw new NotFoundError(errorMessageForError('not-found-zdao'));
    }

    const zDAORecord = await GlobalClient.etherZDAOChef.getZDAORecordByZNA(zNA);
    return await DAOClient.createInstance(this._config, zDAORecord.id);
  }

  async doesZDAOExist(zNA: zNA): Promise<boolean> {
    return await GlobalClient.etherZDAOChef.doeszDAOExistForzNA(zNA);
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
      !isBigNumberish(params.minimumTotalVotingTokens) ||
      BigNumber.from(params.amount).eq(BigNumber.from(0))
    ) {
      throw new InvalidError(errorMessageForError('invalid-quorum-amount'));
    }

    const exist = await this.doesZDAOExistFromParams(params.zNA);
    if (exist) {
      throw new AlreadyExistError(errorMessageForError('already-exist-zdao'));
    }

    const zNAId: zNAId = ZNAClient.zNATozNAId(params.zNA);

    // signer should be owner of zNA
    const account = await signer.getAddress();
    if (!GlobalClient.znsHub.isOwnerOf(zNAId, account)) {
      throw new InvalidError(errorMessageForError('not-zna-owner'));
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
