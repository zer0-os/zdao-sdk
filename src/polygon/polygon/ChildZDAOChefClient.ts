import { AddressZero } from '@ethersproject/constants';
import { ethers } from 'ethers';

import { Choice, DAOConfig, ProposalId, zDAOId } from '../../types';
import GlobalClient from '../client/GlobalClient';
import ChildZDAOAbi from '../config/abi/ChildZDAO.json';
import ChildZDAOChefAbi from '../config/abi/ChildZDAOChef.json';
import { ChildZDAO } from '../config/types/ChildZDAO';
import { ChildZDAOChef } from '../config/types/ChildZDAOChef';
import { StakingProperties } from '../types';
import { ChildZDAOProperties } from './types';

class ChildZDAOChefClient {
  private readonly _config: DAOConfig;
  protected readonly _contract: ChildZDAOChef;

  constructor(config: DAOConfig) {
    this._config = config;
    this._contract = new ethers.Contract(
      config.zDAOChef,
      ChildZDAOChefAbi.abi,
      GlobalClient.polyRpcProvider
    ) as ChildZDAOChef;
  }

  get config(): DAOConfig {
    return this._config;
  }

  async numberOfzDAOs(): Promise<number> {
    return (await this._contract.numberOfzDAOs()).toNumber();
  }

  async getZDAOById(daoId: zDAOId): Promise<ChildZDAO | null> {
    const iChildZDAO = await this._contract.getzDAOById(daoId);
    if (!iChildZDAO || iChildZDAO === AddressZero) return null;

    return new ethers.Contract(
      iChildZDAO,
      ChildZDAOAbi.abi,
      GlobalClient.polyRpcProvider
    ) as ChildZDAO;
  }

  async getZDAOProperties(daoId: zDAOId): Promise<ChildZDAOProperties> {
    const address = await this._contract.getzDAOById(daoId);
    const childZDAO = new ethers.Contract(
      address,
      ChildZDAOAbi.abi,
      GlobalClient.polyRpcProvider
    ) as ChildZDAO;

    const zDAOInfo = await childZDAO.zDAOInfo();

    return {
      id: zDAOInfo.zDAOId.toString(),
      address: childZDAO.address,
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
    console.log('currentBlock', currentBlock);

    const creationBlock = this._config.blockNumber;
    console.log('creationBlock', creationBlock);

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

export default ChildZDAOChefClient;
