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
import FxStateRootTunnelAbi from '../config/abi/FxStateRootTunnel.json';
import RootZDAOAbi from '../config/abi/RootZDAO.json';
import RootZDAOChefAbi from '../config/abi/RootZDAOChef.json';
import { FxStateRootTunnel } from '../config/types/FxStateRootTunnel';
import { RootZDAO } from '../config/types/RootZDAO';
import { RootZDAOChef } from '../config/types/RootZDAOChef';
import { CreateZDAOParamsOptions } from '../types';
import { RootZDAOProperties } from './types';

class RootZDAOChefClient {
  private readonly _config: DAOConfig;
  protected _contract!: RootZDAOChef;
  protected _rootStateSender!: FxStateRootTunnel;

  constructor(config: DAOConfig) {
    this._config = config;

    return (async (): Promise<RootZDAOChefClient> => {
      this._contract = new ethers.Contract(
        config.zDAOChef,
        RootZDAOChefAbi.abi,
        GlobalClient.etherRpcProvider
      ) as RootZDAOChef;

      const address = await this._contract.rootStateSender();
      this._rootStateSender = new ethers.Contract(
        address,
        FxStateRootTunnelAbi.abi,
        GlobalClient.etherRpcProvider
      ) as FxStateRootTunnel;

      return this;
    })() as unknown as RootZDAOChefClient;
  }

  get config(): DAOConfig {
    return this._config;
  }

  stateSender(): Promise<string> {
    return this._contract.rootStateSender();
  }

  // async getZDAOByZNA(zNA: zNA): Promise<RootZDAO> {
  //   const zDAORecord = await this._contract.getzDaoByZNA(
  //     ZNAClient.zNATozNAId(zNA)
  //   );

  //   return new ethers.Contract(
  //     zDAORecord.zDAO,
  //     RootZDAOAbi.abi,
  //     GlobalClient.etherRpcProvider
  //   ) as RootZDAO;
  // }

  async getZDAOById(zDAOId: zDAOId): Promise<RootZDAO> {
    const zDAO = await this._contract.zDAOs(zDAOId);

    return new ethers.Contract(
      zDAO,
      RootZDAOAbi.abi,
      GlobalClient.etherRpcProvider
    ) as RootZDAO;
  }

  async getZDAOPropertiesById(zDAOId: zDAOId): Promise<RootZDAOProperties> {
    const zDAORecord = await GlobalClient.zDAORegistry.getZDAORecordById(
      zDAOId
    );

    const etherZDAO = new ethers.Contract(
      zDAORecord.zDAO,
      RootZDAOAbi.abi,
      GlobalClient.etherRpcProvider
    ) as RootZDAO;
    const zDAOInfo = await etherZDAO.zDAOInfo();

    const token = await getToken(GlobalClient.etherRpcProvider, zDAOInfo.token);
    const zNAs: zNA[] = zDAORecord.associatedzNAs;

    return {
      id: zDAOInfo.zDAOId.toString(),
      address: zDAORecord.zDAO,
      zNAs,
      title: zDAOInfo.title,
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
      ethers.utils.defaultAbiCoder.encode(
        [
          'string',
          'address',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'bool',
        ],
        [
          payload.title,
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

export default RootZDAOChefClient;
