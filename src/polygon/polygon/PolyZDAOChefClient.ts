import { AddressZero } from '@ethersproject/constants';
import { ethers } from 'ethers';

import { Choice, DAOConfig, ProposalId, zDAOId } from '../../types';
import GlobalClient from '../client/GlobalClient';
import PolyZDAOAbi from '../config/abi/PolyZDAO.json';
import PolyZDAOChefAbi from '../config/abi/PolyZDAOChef.json';
import { PolyZDAO } from '../config/types/PolyZDAO';
import { PolyZDAOChef } from '../config/types/PolyZDAOChef';
import { StakingProperties } from '../types';
import { PolyZDAOProperties } from './types';

class PolyZDAOChefClient {
  private readonly _config: DAOConfig;
  protected readonly _contract: PolyZDAOChef;

  constructor(config: DAOConfig) {
    this._config = config;
    this._contract = new ethers.Contract(
      config.zDAOChef,
      PolyZDAOChefAbi.abi,
      GlobalClient.polyRpcProvider
    ) as PolyZDAOChef;
  }

  get config(): DAOConfig {
    return this._config;
  }

  async numberOfzDAOs(): Promise<number> {
    return (await this._contract.numberOfzDAOs()).toNumber();
  }

  async getZDAOById(daoId: zDAOId): Promise<PolyZDAO | null> {
    const iPolyZDAO = await this._contract.getzDAOById(daoId);
    if (!iPolyZDAO || iPolyZDAO === AddressZero) return null;

    return new ethers.Contract(
      iPolyZDAO,
      PolyZDAOAbi.abi,
      GlobalClient.polyRpcProvider
    ) as PolyZDAO;
  }

  async getZDAOProperties(daoId: zDAOId): Promise<PolyZDAOProperties> {
    const address = await this._contract.getzDAOById(daoId);
    const polyZDAO = new ethers.Contract(
      address,
      PolyZDAOAbi.abi,
      GlobalClient.polyRpcProvider
    ) as PolyZDAO;

    const zDAOInfo = await polyZDAO.zDAOInfo();

    return {
      id: zDAOInfo.zDAOId.toString(),
      address: polyZDAO.address,
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

export default PolyZDAOChefClient;
