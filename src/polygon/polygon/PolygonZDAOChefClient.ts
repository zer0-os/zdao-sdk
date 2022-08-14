import { AddressZero } from '@ethersproject/constants';
import { BigNumber, ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { PlatformType } from '../..';
import { Choice, ProposalId, zDAOId } from '../../types';
import {
  calculateGasMargin,
  generateProposalId,
  generateZDAOId,
} from '../../utilities';
import GlobalClient from '../client/GlobalClient';
import { PolygonZDAO__factory } from '../config/types/factories/PolygonZDAO__factory';
import { PolygonZDAOChef__factory } from '../config/types/factories/PolygonZDAOChef__factory';
import { PolygonZDAO } from '../config/types/PolygonZDAO';
import { PolygonZDAOChef } from '../config/types/PolygonZDAOChef';
import { PolygonDAOConfig, StakingProperties } from '../types';
import {
  POLYGONPROPOSAL_BY_QUERY,
  POLYGONPROPOSALS_BY_QUERY,
  PolygonSubgraphProposal,
  PolygonSubgraphVote,
  PolygonSubgraphZDAO,
  POLYGONVOTES_BY_QUERY,
  PolygonZDAOProperties,
  POLYGONZDAOS_BY_QUERY,
} from './types';

class PolygonZDAOChefClient {
  private readonly config: PolygonDAOConfig;
  protected readonly contract: PolygonZDAOChef;
  private readonly zDAOGQLClient: GraphQLClient;

  constructor(config: PolygonDAOConfig, provider: ethers.providers.Provider) {
    this.config = config;
    this.contract = PolygonZDAOChef__factory.connect(config.zDAOChef, provider);
    this.zDAOGQLClient = new GraphQLClient(config.subgraphUri);
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
  ): Promise<PolygonSubgraphZDAO | undefined> {
    const result = await this.zDAOGQLClient.request(POLYGONZDAOS_BY_QUERY, {
      zDAOId: generateZDAOId(PlatformType.Polygon, zDAOId),
    });
    if (result.polygonZDAOs.length < 1) {
      return undefined;
    }
    const zDAO = result.polygonZDAOs[0];
    return {
      zDAOId: zDAO.zDAOId,
      token: zDAO.token,
      duration: zDAO.duration,
      votingDelay: zDAO.votingDelay,
      snapshot: zDAO.snapshot,
      destroyed: zDAO.destroyed,
    };
  }

  async getZDAOPropertiesById(
    zDAOId: zDAOId
  ): Promise<PolygonZDAOProperties | undefined> {
    const zDAOInfo = await this.getZDAOInfoById(zDAOId);

    return (
      zDAOInfo && {
        id: zDAOInfo?.zDAOId,
        duration: zDAOInfo?.duration,
        token: zDAOInfo.token,
        snapshot: zDAOInfo.snapshot,
        destroyed: zDAOInfo.destroyed,
      }
    );
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

  async listProposals(zDAOId: zDAOId): Promise<PolygonSubgraphProposal[]> {
    const result = await this.zDAOGQLClient.request(POLYGONPROPOSALS_BY_QUERY, {
      zDAOId: generateZDAOId(PlatformType.Polygon, zDAOId),
    });

    return result.polygonProposals.map(
      (proposal: any): PolygonSubgraphProposal => ({
        proposalId: proposal.proposalId,
        numberOfChoices: proposal.numberOfChoices,
        startTimestamp: proposal.startTimestamp,
        endTimestamp: proposal.endTimestamp,
        voters: proposal.voters,
        snapshot: proposal.snapshot,
        canceled: proposal.canceled,
        calculated: proposal.calculated,
        sumOfVotes: proposal.sumOfVotes.map((votes: string) =>
          BigNumber.from(votes)
        ),
      })
    );
  }

  async getProposal(
    zDAOId: zDAOId,
    proposalId: ProposalId
  ): Promise<PolygonSubgraphProposal | undefined> {
    const result = await this.zDAOGQLClient.request(POLYGONPROPOSAL_BY_QUERY, {
      proposalId: generateProposalId(PlatformType.Polygon, zDAOId, proposalId),
    });
    if (
      !result ||
      !Array.isArray(result.polygonProposals) ||
      result.polygonProposals.length < 1
    ) {
      return undefined;
    }

    const proposal = result.ethereumProposals[0];

    return {
      proposalId: proposal.proposalId,
      numberOfChoices: proposal.numberOfChoices,
      startTimestamp: proposal.startTimestamp,
      endTimestamp: proposal.endTimestamp,
      voters: proposal.voters,
      snapshot: proposal.snapshot,
      canceled: proposal.canceled,
      calculated: proposal.calculated,
      sumOfVotes: result.sumOfVotes.map((votes: string) =>
        BigNumber.from(votes)
      ),
    };
  }

  async listVotes(
    zDAOId: zDAOId,
    proposalId: ProposalId
  ): Promise<PolygonSubgraphVote[]> {
    const result = await this.zDAOGQLClient.request(POLYGONVOTES_BY_QUERY, {
      proposalId: generateProposalId(PlatformType.Polygon, zDAOId, proposalId),
    });

    return result.proposalVotes.map(
      (vote: any): PolygonSubgraphVote => ({
        choice: vote.choice,
        voter: vote.voter,
        votingPower: BigNumber.from(vote.votingPower),
      })
    );
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
