import { BigNumber, ethers } from 'ethers';
import { GraphQLClient } from 'graphql-request';

import { PlatformType } from '../..';
import { ZDAORecord } from '../../client/ZDAORegistry';
import { EthereumDAOConfig, ProposalId, zDAOId } from '../../types';
import {
  calculateGasMargin,
  generateProposalId,
  generateZDAOId,
  getToken,
  getTotalSupply,
} from '../../utilities';
import GlobalClient from '../client/GlobalClient';
import { EthereumZDAO } from '../config/types/EthereumZDAO';
import { EthereumZDAOChef } from '../config/types/EthereumZDAOChef';
import { EthereumZDAO__factory } from '../config/types/factories/EthereumZDAO__factory';
import { EthereumZDAOChef__factory } from '../config/types/factories/EthereumZDAOChef__factory';
import { FxStateEthereumTunnel__factory } from '../config/types/factories/FxStateEthereumTunnel__factory';
import { FxStateEthereumTunnel } from '../config/types/FxStateEthereumTunnel';
import { CreatePolygonProposalParams, CreatePolygonZDAOParams } from '../types';
import {
  ETHEREUMPROPOSAL_BY_QUERY,
  ETHEREUMPROPOSALS_BY_QUERY,
  EthereumSubgraphProposal,
  EthereumSubgraphZDAO,
  EthereumZDAOProperties,
  ETHEREUMZDAOS_BY_QUERY,
} from './types';

class EthereumZDAOChefClient {
  private readonly config: EthereumDAOConfig;
  protected contract!: EthereumZDAOChef;
  protected rootStateSender?: FxStateEthereumTunnel;
  private readonly zDAOGQLClient: GraphQLClient;

  constructor(config: EthereumDAOConfig, provider: ethers.providers.Provider) {
    this.config = config;

    this.contract = EthereumZDAOChef__factory.connect(
      config.zDAOChef,
      provider
    );
    this.zDAOGQLClient = new GraphQLClient(config.subgraphUri);
  }

  private async getRootStateSender(): Promise<FxStateEthereumTunnel> {
    if (!this.rootStateSender) {
      const address = await this.contract.ethereumStateSender();
      this.rootStateSender = FxStateEthereumTunnel__factory.connect(
        address,
        GlobalClient.etherRpcProvider
      );
    }
    return this.rootStateSender;
  }

  async getZDAOById(zDAOId: zDAOId): Promise<EthereumZDAO> {
    const zDAO = await this.contract.zDAOs(zDAOId);

    return EthereumZDAO__factory.connect(zDAO, GlobalClient.etherRpcProvider);
  }

  async getZDAOInfoById(
    zDAOId: zDAOId
  ): Promise<EthereumSubgraphZDAO | undefined> {
    const result = await this.zDAOGQLClient.request(ETHEREUMZDAOS_BY_QUERY, {
      zDAOId: generateZDAOId(PlatformType.Polygon, zDAOId),
    });
    if (
      !result ||
      !Array.isArray(result.ethereumZDAOs) ||
      result.ethereumZDAOs.length < 1
    ) {
      return undefined;
    }

    const zDAO = result.ethereumZDAOs[0];
    return {
      zDAOId: zDAO.zDAORecord.zDAOId,
      name: zDAO.zDAORecord.name,
      createdBy: zDAO.zDAORecord.createdBy,
      gnosisSafe: ethers.utils.getAddress(zDAO.zDAORecord.gnosisSafe),
      token: zDAO.token,
      amount: BigNumber.from(zDAO.amount),
      duration: zDAO.duration,
      votingDelay: zDAO.votingDelay,
      votingThreshold: zDAO.votingThreshold,
      minimumVotingParticipants: zDAO.minimumVotingParticipants,
      minimumTotalVotingTokens: zDAO.minimumTotalVotingTokens,
      isRelativeMajority: zDAO.isRelativeMajority,
      snapshot: zDAO.snapshot,
      destroyed: zDAO.zDAORecord.destroyed,
    };
  }

  async getZDAOPropertiesById(
    zDAORecord: ZDAORecord
  ): Promise<EthereumZDAOProperties | undefined> {
    const zDAOInfo = await this.getZDAOInfoById(zDAORecord.id);
    if (!zDAOInfo) {
      return undefined;
    }

    const results = await Promise.all([
      getToken(GlobalClient.etherRpcProvider, zDAOInfo.token),
      getTotalSupply(GlobalClient.etherRpcProvider, zDAOInfo.token),
    ]);

    return {
      id: zDAOInfo.zDAOId.toString(),
      zNAs: zDAORecord.associatedzNAs,
      name: zDAORecord.name,
      createdBy: ethers.utils.getAddress(zDAOInfo.createdBy),
      network: GlobalClient.etherNetwork,
      gnosisSafe: ethers.utils.getAddress(zDAOInfo.gnosisSafe),
      votingToken: results[0],
      minimumVotingTokenAmount: zDAOInfo.amount.toString(),
      totalSupplyOfVotingToken: results[1].toString(),
      votingDuration: zDAOInfo.duration,
      votingDelay: zDAOInfo.votingDelay,
      votingThreshold: zDAOInfo.votingThreshold,
      minimumVotingParticipants: zDAOInfo.minimumVotingParticipants,
      minimumTotalVotingTokens: zDAOInfo.minimumTotalVotingTokens.toString(),
      snapshot: zDAOInfo.snapshot,
      isRelativeMajority: zDAOInfo.isRelativeMajority,
      destroyed: zDAOInfo.destroyed,
    };
  }

  async addNewZDAO(signer: ethers.Signer, payload: CreatePolygonZDAOParams) {
    await GlobalClient.zDAORegistry.addNewZDAO(
      signer,
      PlatformType.Polygon,
      payload.zNA,
      payload.gnosisSafe,
      payload.name,
      ethers.utils.defaultAbiCoder.encode(
        [
          'address',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'bool',
        ],
        [
          payload.votingToken,
          payload.minimumVotingTokenAmount,
          payload.votingDuration,
          payload.votingDelay ?? 0,
          payload.votingThreshold,
          payload.minimumVotingParticipants,
          payload.minimumTotalVotingTokens,
          payload.isRelativeMajority,
        ]
      )
    );
  }

  async removeZDAO(signer: ethers.Signer, zDAOId: zDAOId) {
    await GlobalClient.zDAORegistry.removeZDAO(signer, zDAOId);
  }

  async listProposals(zDAOId: zDAOId): Promise<EthereumSubgraphProposal[]> {
    const result = await this.zDAOGQLClient.request(
      ETHEREUMPROPOSALS_BY_QUERY,
      {
        zDAOId: generateZDAOId(PlatformType.Polygon, zDAOId),
      }
    );

    return result.ethereumProposals.map(
      (proposal: any): EthereumSubgraphProposal => ({
        proposalId: proposal.proposalId,
        numberOfChoices: proposal.numberOfChoices,
        createdBy: proposal.createdBy,
        snapshot: proposal.snapshot,
        ipfs: proposal.ipfs,
        created: proposal.created,
        canceled: proposal.canceled,
        calculated: proposal.calculated,
      })
    );
  }

  async getProposal(
    zDAOId: zDAOId,
    proposalId: ProposalId
  ): Promise<EthereumSubgraphProposal | undefined> {
    const result = await this.zDAOGQLClient.request(ETHEREUMPROPOSAL_BY_QUERY, {
      proposalId: generateProposalId(PlatformType.Polygon, zDAOId, proposalId),
    });
    if (
      !result ||
      !Array.isArray(result.ethereumProposals) ||
      result.ethereumProposals.length < 1
    ) {
      return undefined;
    }

    const proposal = result.ethereumProposals[0];
    return {
      proposalId: proposal.proposalId,
      numberOfChoices: proposal.numberOfChoices,
      createdBy: proposal.createdBy,
      snapshot: proposal.snapshot,
      ipfs: proposal.ipfs,
      created: proposal.created,
      canceled: proposal.canceled,
      calculated: proposal.calculated,
    };
  }

  async createProposal(
    signer: ethers.Signer,
    zDAOId: zDAOId,
    payload: CreatePolygonProposalParams,
    ipfs: string
  ): Promise<BigNumber> {
    const gasEstimated = await this.contract
      .connect(signer)
      .estimateGas.createProposal(zDAOId, payload.choices!, ipfs);

    const tx = await this.contract
      .connect(signer)
      .createProposal(zDAOId, payload.choices!, ipfs, {
        gasLimit: calculateGasMargin(gasEstimated),
      });

    const proposalCreatedTopic = ethers.utils.id(
      'ProposalCreated(uint256,uint256,uint256,address,uint256,string)'
    );
    const proposalCreatedInterface = new ethers.utils.Interface([
      'event ProposalCreated(uint256 indexed _zDAOId, uint256 indexed _proposalId, uint256 indexed _numberOfChoices, address _createdBy, uint256 _snapshot, string _ipfs)',
    ]);

    return await tx
      .wait()
      .then((receipt: ethers.ContractReceipt) => {
        if (!receipt.events) {
          throw new Error('Not found emitted events');
        }
        const events = receipt.events?.filter(
          (event: ethers.Event) => event.topics[0] === proposalCreatedTopic
        );
        if (events.length < 1) {
          throw new Error('Not found ProposalCreated events');
        }
        const lastEvent = events.slice(-1)[0];
        const parsed = proposalCreatedInterface.parseLog(lastEvent);
        return parsed.args._proposalId;
      })
      .catch((reason) => {
        throw new Error(reason);
      });
  }

  async cancelProposal(
    signer: ethers.Signer,
    zDAOId: zDAOId,
    proposalId: ProposalId
  ) {
    const gasEstimated = await this.contract
      .connect(signer)
      .estimateGas.cancelProposal(zDAOId, proposalId);

    const tx = await this.contract
      .connect(signer)
      .cancelProposal(zDAOId, proposalId, {
        gasLimit: calculateGasMargin(gasEstimated),
      });
    return await tx.wait();
  }

  async receiveMessage(signer: ethers.Signer, proof: string) {
    const instance = await this.getRootStateSender();
    const gasEstimated = await instance
      .connect(signer)
      .estimateGas.receiveMessage(proof);

    const tx = await instance.connect(signer).receiveMessage(proof, {
      gasLimit: calculateGasMargin(gasEstimated),
    });
    return await tx.wait();
  }
}

export default EthereumZDAOChefClient;
