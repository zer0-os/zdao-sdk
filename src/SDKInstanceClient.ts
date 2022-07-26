import { BigNumber, ethers } from 'ethers';
import shortid from 'shortid';

import DAOClient from './client/DAOClient';
import ERC1967ProxyAbi from './config/constants/abi/ERC1967Proxy.json';
import ZeroTokenAbi from './config/constants/abi/ZeroToken.json';
import SnapshotClient from './snapshot-io';
import {
  Config,
  CreateZDAOParams,
  SDKInstance,
  TokenMintOptions,
  zDAO,
  zNA,
} from './types';
import { getDecimalAmount } from './utilities';
import { getToken, getTotalSupply } from './utilities/calls';
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

  async listZNAs(): Promise<zNA[]> {
    return await this._zDAORegistryClient.listZNAs();
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
      (strategy) =>
        strategy.name.startsWith('erc20') || strategy.name.startsWith('erc721')
    );
    if (!strategy) {
      throw new Error(errorMessageForError('not-found-strategy-in-snapshot'));
    }

    const symbol = strategy.params.symbol;
    const decimals = strategy.params.decimals ?? 0;

    const totalSupplyOfVotingToken = await getTotalSupply(
      this._config.zNA.provider,
      strategy.params.address
    );
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
      this._config,
      {
        id: zDAORecord.id,
        ens: zDAORecord.ens,
        zNAs: zDAORecord.zNAs,
        title: space.name,
        creator: space.admins.length > 0 ? space.admins[0] : zDAORecord.ens,
        network: this._config.snapshot.network, // space.network,
        duration: space.duration,
        safeAddress: zDAORecord.gnosisSafe,
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

  async createZDAOFromParams(param: CreateZDAOParams): Promise<zDAO> {
    const found = this._params.find(
      (item: CreateZDAOParams) => item.zNA === param.zNA
    );
    if (found) {
      throw new Error(errorMessageForError('already-exist-zdao'));
    }
    if (param.title.length < 1) {
      throw new Error(errorMessageForError('empty-zdao-title'));
    }
    if (param.safeAddress.length < 1) {
      throw new Error(errorMessageForError('empty-gnosis-address'));
    }
    if (param.votingToken.length < 1) {
      throw new Error(errorMessageForError('empty-voting-token'));
    }

    this._params.push(param);

    const calls = await Promise.all([
      getToken(this._config.zNA.provider, param.votingToken),
      getTotalSupply(this._config.zNA.provider, param.votingToken),
    ]);

    return await DAOClient.createInstance(
      this._config,
      {
        id: shortid.generate(),
        ens: param.ens,
        zNAs: [param.zNA],
        title: param.title,
        creator: param.creator,
        network: param.network.toString(),
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
    return Promise.resolve(this._params.map((param) => param.zNA));
  }

  async getZDAOByZNAFromParams(zNA: zNA): Promise<zDAO> {
    if (!this.doesZDAOExist(zNA)) {
      throw new Error(errorMessageForError('not-found-zdao'));
    }

    const found = this._params.find((param) => param.zNA === zNA);
    if (!found) throw new Error(errorMessageForError('not-found-zdao'));

    const calls = await Promise.all([
      getToken(this._config.zNA.provider, found.votingToken),
      getTotalSupply(this._config.zNA.provider, found.votingToken),
    ]);

    return await DAOClient.createInstance(
      this._config,
      {
        id: shortid.generate(),
        ens: found.ens,
        zNAs: [found.zNA],
        title: found.title,
        creator: found.creator,
        network: found.network.toString(),
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
    const found = this._params.find((param) => param.zNA === zNA);
    return Promise.resolve(found ? true : false);
  }
}

export default SDKInstanceClient;
