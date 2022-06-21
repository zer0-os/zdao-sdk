import { AddressZero } from '@ethersproject/constants';
import { ethers } from 'ethers';

import { Choice, DAOConfig, ProposalId, zDAOId } from '../../types';
import GlobalClient from '../client/GlobalClient';
import PolygonZDAOAbi from '../config/abi/PolygonZDAO.json';
import PolygonZDAOChefAbi from '../config/abi/PolygonZDAOChef.json';
import { PolygonZDAO } from '../config/types/PolygonZDAO';
import { PolygonZDAOChef } from '../config/types/PolygonZDAOChef';
import { StakingProperties } from '../types';
import { PolygonZDAOProperties } from './types';

class PolygonZDAOChefClient {
  private readonly _config: DAOConfig;
  protected readonly _contract: PolygonZDAOChef;

  constructor(config: DAOConfig) {
    this._config = config;
    this._contract = new ethers.Contract(
      config.zDAOChef,
      PolygonZDAOChefAbi.abi,
      GlobalClient.polyRpcProvider
    ) as PolygonZDAOChef;
  }

  get config(): DAOConfig {
    return this._config;
  }

  async numberOfzDAOs(): Promise<number> {
    return (await this._contract.numberOfzDAOs()).toNumber();
  }

  async getZDAOById(daoId: zDAOId): Promise<PolygonZDAO | null> {
    const iPolygonZDAO = await this._contract.getzDAOById(daoId);
    if (!iPolygonZDAO || iPolygonZDAO === AddressZero) return null;

    return new ethers.Contract(
      iPolygonZDAO,
      PolygonZDAOAbi.abi,
      GlobalClient.polyRpcProvider
    ) as PolygonZDAO;
  }

  async getZDAOProperties(daoId: zDAOId): Promise<PolygonZDAOProperties> {
    const address = await this._contract.getzDAOById(daoId);
    const polygonZDAO = new ethers.Contract(
      address,
      PolygonZDAOAbi.abi,
      GlobalClient.polyRpcProvider
    ) as PolygonZDAO;

    const zDAOInfo = await polygonZDAO.zDAOInfo();

    return {
      id: zDAOInfo.zDAOId.toString(),
      address: polygonZDAO.address,
      snapshot: zDAOInfo.snapshot.toNumber(),
      destroyed: zDAOInfo.destroyed,
    };
  }

  async getStakingProperties(): Promise<StakingProperties> {
    const address = await this._contract.staking();
    return {
      network: this._config.network,
      address,
    };
  }

  getRegistryAddress(): Promise<string> {
    return this._contract.childChainManager();
  }

  async vote(
    signer: ethers.Signer,
    daoId: zDAOId,
    proposalId: ProposalId,
    choice: Choice
  ) {
    const tx = await this._contract
      .connect(signer)
      .vote(daoId, proposalId, choice);
    return await tx.wait();
  }

  async calculateProposal(
    signer: ethers.Signer,
    daoId: zDAOId,
    proposalId: ProposalId
  ) {
    const tx = await this._contract
      .connect(signer)
      .calculateProposal(daoId, proposalId);
    return await tx.wait();
  }

  async getCheckPointingHashes(
    daoId: zDAOId,
    proposalId: ProposalId
  ): Promise<string[]> {
    const currentBlock = await this._contract.provider.getBlockNumber();
    const creationBlock = this._config.blockNumber;

    // event ProposalCalculated(
    //   uint256 indexed _zDAOId,
    //   uint256 indexed _proposalId,
    //   uint256 _voters,
    //   uint256 _yes,
    //   uint256 _no
    // )

    const blockCount = 3490;

    const filter = this._contract.filters.ProposalCalculated(
      ethers.BigNumber.from(daoId),
      ethers.BigNumber.from(proposalId)
    );
    const events = [];
    let fromBlock = creationBlock;
    while (fromBlock < currentBlock) {
      const filtered = await this._contract.queryFilter(
        filter,
        fromBlock,
        Math.min(fromBlock + blockCount, currentBlock)
      );
      events.push(...filtered);
      fromBlock += blockCount;
    }

    return events.map((event) => event.transactionHash);
  }
}

export default PolygonZDAOChefClient;
