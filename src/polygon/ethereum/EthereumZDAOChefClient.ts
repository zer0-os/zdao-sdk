import { ethers } from 'ethers';

import { PlatformType } from '../..';
import { ZDAORecord } from '../../client/ZDAORegistry';
import { EthereumDAOConfig, ProposalId, zDAOId } from '../../types';
import { calculateGasMargin, getToken, getTotalSupply } from '../../utilities';
import GlobalClient from '../client/GlobalClient';
import { EthereumZDAO, IEthereumZDAO } from '../config/types/EthereumZDAO';
import { EthereumZDAOChef } from '../config/types/EthereumZDAOChef';
import { EthereumZDAO__factory } from '../config/types/factories/EthereumZDAO__factory';
import { EthereumZDAOChef__factory } from '../config/types/factories/EthereumZDAOChef__factory';
import { FxStateEthereumTunnel__factory } from '../config/types/factories/FxStateEthereumTunnel__factory';
import { FxStateEthereumTunnel } from '../config/types/FxStateEthereumTunnel';
import { CreatePolygonProposalParams, CreatePolygonZDAOParams } from '../types';
import { EthereumZDAOProperties } from './types';

class EthereumZDAOChefClient {
  private readonly config: EthereumDAOConfig;
  protected contract!: EthereumZDAOChef;
  protected rootStateSender?: FxStateEthereumTunnel;

  constructor(config: EthereumDAOConfig, provider: ethers.providers.Provider) {
    this.config = config;

    this.contract = EthereumZDAOChef__factory.connect(
      config.zDAOChef,
      provider
    );
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

  getZDAOInfoById(zDAOId: zDAOId): Promise<IEthereumZDAO.ZDAOInfoStructOutput> {
    return this.contract.getZDAOInfoById(zDAOId);
  }

  async getZDAOPropertiesById(
    zDAORecord: ZDAORecord
  ): Promise<EthereumZDAOProperties> {
    const zDAOInfo = await this.contract.getZDAOInfoById(zDAORecord.id);

    const results = await Promise.all([
      getToken(GlobalClient.etherRpcProvider, zDAOInfo.token),
      getTotalSupply(GlobalClient.etherRpcProvider, zDAOInfo.token),
    ]);

    const network = await this.contract.provider.getNetwork();

    return {
      id: zDAOInfo.zDAOId.toString(),
      zNAs: zDAORecord.associatedzNAs,
      name: zDAORecord.name,
      createdBy: zDAOInfo.createdBy,
      network: network.chainId,
      gnosisSafe: zDAOInfo.gnosisSafe,
      votingToken: results[0],
      minimumVotingTokenAmount: zDAOInfo.amount.toString(),
      totalSupplyOfVotingToken: results[1].toString(),
      votingDuration: zDAOInfo.duration.toNumber(),
      votingDelay: zDAOInfo.votingDelay.toNumber(),
      votingThreshold: zDAOInfo.votingThreshold.toNumber(),
      minimumVotingParticipants: zDAOInfo.minimumVotingParticipants.toNumber(),
      minimumTotalVotingTokens: zDAOInfo.minimumTotalVotingTokens.toString(),
      snapshot: zDAOInfo.snapshot.toNumber(),
      isRelativeMajority: zDAOInfo.isRelativeMajority,
      destroyed: zDAOInfo.destroyed,
    };
  }

  async addNewDAO(signer: ethers.Signer, payload: CreatePolygonZDAOParams) {
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

  async removeDAO(signer: ethers.Signer, zDAOId: zDAOId) {
    await GlobalClient.zDAORegistry.removeNewZDAO(signer, zDAOId);
  }

  async createProposal(
    signer: ethers.Signer,
    zDAOId: zDAOId,
    payload: CreatePolygonProposalParams,
    ipfs: string
  ) {
    const gasEstimated = await this.contract
      .connect(signer)
      .estimateGas.createProposal(zDAOId, payload.choices, ipfs);

    const tx = await this.contract
      .connect(signer)
      .createProposal(zDAOId, payload.choices, ipfs, {
        gasLimit: calculateGasMargin(gasEstimated),
      });
    return await tx.wait();
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

  async executeProposal(
    signer: ethers.Signer,
    zDAOId: zDAOId,
    proposalId: ProposalId
  ) {
    const gasEstimated = await this.contract
      .connect(signer)
      .estimateGas.executeProposal(zDAOId, proposalId);

    const tx = await this.contract
      .connect(signer)
      .executeProposal(zDAOId, proposalId, {
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
