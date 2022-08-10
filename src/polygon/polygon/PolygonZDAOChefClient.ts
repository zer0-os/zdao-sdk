import { AddressZero } from '@ethersproject/constants';
import { ethers } from 'ethers';

import { Choice, ProposalId, zDAOId } from '../../types';
import { calculateGasMargin } from '../../utilities';
import GlobalClient from '../client/GlobalClient';
import { PolygonZDAO__factory } from '../config/types/factories/PolygonZDAO__factory';
import { PolygonZDAOChef__factory } from '../config/types/factories/PolygonZDAOChef__factory';
import { IPolygonZDAO, PolygonZDAO } from '../config/types/PolygonZDAO';
import { PolygonZDAOChef } from '../config/types/PolygonZDAOChef';
import { PolygonDAOConfig, StakingProperties } from '../types';
import { PolygonZDAOProperties } from './types';

class PolygonZDAOChefClient {
  private readonly config: PolygonDAOConfig;
  protected readonly contract: PolygonZDAOChef;

  constructor(config: PolygonDAOConfig, provider: ethers.providers.Provider) {
    this.config = config;
    this.contract = PolygonZDAOChef__factory.connect(config.zDAOChef, provider);
  }

  async getZDAOById(zDAOId: zDAOId): Promise<PolygonZDAO | null> {
    const iPolygonZDAO = await this.contract.getZDAOById(zDAOId);
    if (!iPolygonZDAO || iPolygonZDAO === AddressZero) return null;

    return PolygonZDAO__factory.connect(
      iPolygonZDAO,
      GlobalClient.polyRpcProvider
    );
  }

  async getZDAOInfoById(
    zDAOId: zDAOId
  ): Promise<IPolygonZDAO.ZDAOInfoStructOutput | undefined> {
    return this.contract.getZDAOInfoById(zDAOId).catch(() => undefined);
  }

  async getZDAOPropertiesById(zDAOId: zDAOId): Promise<PolygonZDAOProperties> {
    const zDAOInfo = await this.contract.getZDAOInfoById(zDAOId);

    return {
      id: zDAOInfo.zDAOId.toString(),
      duration: zDAOInfo.duration.toNumber(),
      token: zDAOInfo.token.toString(),
      snapshot: zDAOInfo.snapshot.toNumber(),
      destroyed: zDAOInfo.destroyed,
    };
  }

  async getStakingProperties(): Promise<StakingProperties> {
    const address = await this.contract.staking();
    return {
      address,
    };
  }

  getRegistryAddress(): Promise<string> {
    return this.contract.childChainManager();
  }

  async vote(
    signer: ethers.Signer,
    zDAOId: zDAOId,
    proposalId: ProposalId,
    choice: Choice
  ) {
    const gasEstimated = await this.contract
      .connect(signer)
      .estimateGas.vote(zDAOId, proposalId, choice);

    const tx = await this.contract
      .connect(signer)
      .vote(zDAOId, proposalId, choice, {
        gasLimit: calculateGasMargin(gasEstimated),
      });
    return await tx.wait();
  }

  async calculateProposal(
    signer: ethers.Signer,
    zDAOId: zDAOId,
    proposalId: ProposalId
  ) {
    const gasEstimated = await this.contract
      .connect(signer)
      .estimateGas.calculateProposal(zDAOId, proposalId);

    const tx = await this.contract
      .connect(signer)
      .calculateProposal(zDAOId, proposalId, {
        gasLimit: calculateGasMargin(gasEstimated),
      });
    return await tx.wait();
  }

  async getCheckPointingHashes(
    zDAOId: zDAOId,
    proposalId: ProposalId
  ): Promise<string[]> {
    const currentBlock = await this.contract.provider.getBlockNumber();
    const creationBlock = this.config.blockNumber;

    // event ProposalCalculated(
    //   uint256 indexed _zDAOId,
    //   uint256 indexed _proposalId,
    //   uint256 _voters,
    //   uint256 _yes,
    //   uint256 _no
    // )

    const blockCount = 3490;

    const filter = this.contract.filters.ProposalCalculated(
      ethers.BigNumber.from(zDAOId),
      ethers.BigNumber.from(proposalId)
    );
    const events = [];
    let fromBlock = creationBlock;
    while (fromBlock < currentBlock) {
      const filtered = await this.contract.queryFilter(
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
