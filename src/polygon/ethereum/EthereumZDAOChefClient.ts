import { ethers } from 'ethers';

import { PlatformType } from '../..';
import { ZDAORecord } from '../../client/ZDAORegistry';
import { DAOConfig, ProposalId, zDAOId, zNA } from '../../types';
import { calculateGasMargin, getToken } from '../../utilities';
import GlobalClient from '../client/GlobalClient';
import EthereumZDAOAbi from '../config/abi/EthereumZDAO.json';
import EthereumZDAOChefAbi from '../config/abi/EthereumZDAOChef.json';
import FxStateEthereumTunnelAbi from '../config/abi/FxStateEthereumTunnel.json';
import { EthereumZDAO } from '../config/types/EthereumZDAO';
import { EthereumZDAOChef } from '../config/types/EthereumZDAOChef';
import { FxStateEthereumTunnel } from '../config/types/FxStateEthereumTunnel';
import { CreatePolygonProposalParams, CreatePolygonZDAOParams } from '../types';
import { EthereumZDAOProperties } from './types';

class EthereumZDAOChefClient {
  private readonly _config: DAOConfig;
  protected _contract!: EthereumZDAOChef;
  protected _rootStateSender!: FxStateEthereumTunnel;

  constructor(config: DAOConfig) {
    this._config = config;

    return (async (): Promise<EthereumZDAOChefClient> => {
      this._contract = new ethers.Contract(
        config.zDAOChef,
        EthereumZDAOChefAbi.abi,
        GlobalClient.etherRpcProvider
      ) as EthereumZDAOChef;

      const address = await this._contract.ethereumStateSender();
      this._rootStateSender = new ethers.Contract(
        address,
        FxStateEthereumTunnelAbi.abi,
        GlobalClient.etherRpcProvider
      ) as FxStateEthereumTunnel;

      return this;
    })() as unknown as EthereumZDAOChefClient;
  }

  get config(): DAOConfig {
    return this._config;
  }

  stateSender(): Promise<string> {
    return this._contract.ethereumStateSender();
  }

  async getZDAOById(zDAOId: zDAOId): Promise<EthereumZDAO> {
    const zDAO = await this._contract.zDAOs(zDAOId);

    return new ethers.Contract(
      zDAO,
      EthereumZDAOAbi.abi,
      GlobalClient.etherRpcProvider
    ) as EthereumZDAO;
  }

  async getZDAOPropertiesById(
    zDAORecord: ZDAORecord
  ): Promise<EthereumZDAOProperties> {
    const zDAOInfo = await this._contract.zDAOInfo(zDAORecord.id);

    const token = await getToken(GlobalClient.etherRpcProvider, zDAOInfo.token);
    const zNAs: zNA[] = zDAORecord.associatedzNAs;

    return {
      id: zDAOInfo.zDAOId.toString(),
      zNAs,
      name: zDAORecord.name,
      createdBy: zDAOInfo.createdBy,
      network: this._config.network,
      gnosisSafe: zDAOInfo.gnosisSafe,
      votingToken: token,
      amount: zDAOInfo.amount.toString(),
      duration: zDAOInfo.duration.toNumber(),
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
          'bool',
        ],
        [
          payload.token,
          payload.amount,
          payload.duration,
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
    const gasEstimated = await this._contract
      .connect(signer)
      .estimateGas.createProposal(zDAOId, ipfs);

    const tx = await this._contract
      .connect(signer)
      .createProposal(zDAOId, ipfs, {
        gasLimit: calculateGasMargin(gasEstimated),
      });
    return await tx.wait();
  }

  async cancelProposal(
    signer: ethers.Signer,
    zDAOId: zDAOId,
    proposalId: ProposalId
  ) {
    const gasEstimated = await this._contract
      .connect(signer)
      .estimateGas.cancelProposal(zDAOId, proposalId);

    const tx = await this._contract
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
    const gasEstimated = await this._contract
      .connect(signer)
      .estimateGas.cancelProposal(zDAOId, proposalId);

    const tx = await this._contract
      .connect(signer)
      .executeProposal(zDAOId, proposalId, {
        gasLimit: calculateGasMargin(gasEstimated),
      });
    return await tx.wait();
  }

  async receiveMessage(signer: ethers.Signer, proof: string) {
    const gasEstimated = await this._rootStateSender
      .connect(signer)
      .estimateGas.receiveMessage(proof);

    const tx = await this._rootStateSender
      .connect(signer)
      .receiveMessage(proof, {
        gasLimit: calculateGasMargin(gasEstimated),
      });
    return await tx.wait();
  }
}

export default EthereumZDAOChefClient;
