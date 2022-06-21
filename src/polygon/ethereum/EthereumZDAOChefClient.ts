import { ethers } from 'ethers';

import { PlatformType } from '../..';
import {
  CreateProposalParams,
  CreateZDAOParams,
  DAOConfig,
  ProposalId,
  zDAOId,
  zNA,
} from '../../types';
import { calculateGasMargin, getToken } from '../../utilities';
import GlobalClient from '../client/GlobalClient';
import EthereumZDAOAbi from '../config/abi/EthereumZDAO.json';
import EthereumZDAOChefAbi from '../config/abi/EthereumZDAOChef.json';
import FxStateEthereumTunnelAbi from '../config/abi/FxStateEthereumTunnel.json';
import { EthereumZDAO } from '../config/types/EthereumZDAO';
import { EthereumZDAOChef } from '../config/types/EthereumZDAOChef';
import { FxStateEthereumTunnel } from '../config/types/FxStateEthereumTunnel';
import { CreateZDAOParamsOptions } from '../types';
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

  // async getZDAOByZNA(zNA: zNA): Promise<EthereumZDAO> {
  //   const zDAORecord = await this._contract.getzDaoByZNA(
  //     ZNAClient.zNATozNAId(zNA)
  //   );

  //   return new ethers.Contract(
  //     zDAORecord.zDAO,
  //     EthereumZDAOAbi.abi,
  //     GlobalClient.etherRpcProvider
  //   ) as EthereumZDAO;
  // }

  async getZDAOById(zDAOId: zDAOId): Promise<EthereumZDAO> {
    const zDAO = await this._contract.zDAOs(zDAOId);

    return new ethers.Contract(
      zDAO,
      EthereumZDAOAbi.abi,
      GlobalClient.etherRpcProvider
    ) as EthereumZDAO;
  }

  async getZDAOPropertiesById(zDAOId: zDAOId): Promise<EthereumZDAOProperties> {
    const zDAORecord = await GlobalClient.zDAORegistry.getZDAORecordById(
      zDAOId
    );

    const zDAOInfo = await this._contract.zDAOInfo(zDAOId);

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

  async addNewDAO(signer: ethers.Signer, payload: CreateZDAOParams) {
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
          (payload.options as CreateZDAOParamsOptions).votingThreshold,
          (payload.options as CreateZDAOParamsOptions)
            .minimumVotingParticipants,
          (payload.options as CreateZDAOParamsOptions).minimumTotalVotingTokens,
          (payload.options as CreateZDAOParamsOptions).isRelativeMajority,
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
    payload: CreateProposalParams,
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
    const tx = await this._contract
      .connect(signer)
      .cancelProposal(zDAOId, proposalId);
    return await tx.wait();
  }

  async executeProposal(
    signer: ethers.Signer,
    zDAOId: zDAOId,
    proposalId: ProposalId
  ) {
    const tx = await this._contract
      .connect(signer)
      .executeProposal(zDAOId, proposalId);
    return await tx.wait();
  }

  async receiveMessage(signer: ethers.Signer, proof: string) {
    const tx = await this._rootStateSender
      .connect(signer)
      .receiveMessage(proof);
    return await tx.wait();
  }
}

export default EthereumZDAOChefClient;
