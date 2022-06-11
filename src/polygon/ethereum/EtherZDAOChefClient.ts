import { ethers } from 'ethers';

import {
  CreateProposalParams,
  CreateZDAOParams,
  ProposalId,
  zDAOId,
  zNA,
  zNAId,
} from '../../types';
import { calculateGasMargin, getToken } from '../../utilities';
import GlobalClient from '../client/GlobalClient';
import ZNAClient from '../client/ZNAClient';
import EtherZDAOAbi from '../config/abi/EtherZDAO.json';
import EtherZDAOChefAbi from '../config/abi/EtherZDAOChef.json';
import FxStateRootTunnelAbi from '../config/abi/FxStateRootTunnel.json';
import { EtherZDAO } from '../config/types/EtherZDAO';
import { EtherZDAOChef } from '../config/types/EtherZDAOChef';
import { FxStateRootTunnel } from '../config/types/FxStateRootTunnel';
import { DAOConfig } from '../types';
import { EtherZDAOProperties, ZDAORecord } from './types';

class EtherZDAOChefClient {
  private readonly _config: DAOConfig;
  protected _contract!: EtherZDAOChef;
  protected _rootStateSender!: FxStateRootTunnel;

  constructor(config: DAOConfig) {
    this._config = config;

    return (async (): Promise<EtherZDAOChefClient> => {
      this._contract = new ethers.Contract(
        config.zDAOChef,
        EtherZDAOChefAbi.abi,
        GlobalClient.etherRpcProvider
      ) as EtherZDAOChef;

      const address = await this._contract.rootStateSender();
      this._rootStateSender = new ethers.Contract(
        address,
        FxStateRootTunnelAbi.abi,
        GlobalClient.etherRpcProvider
      ) as FxStateRootTunnel;

      return this;
    })() as unknown as EtherZDAOChefClient;
  }

  get config(): DAOConfig {
    return this._config;
  }

  znsHub(): Promise<string> {
    return this._contract.znsHub();
  }

  stateSender(): Promise<string> {
    return this._contract.rootStateSender();
  }

  async numberOfzDAOs(): Promise<number> {
    return (await this._contract.numberOfzDAOs()).toNumber();
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const zDAORecord = await this._contract.getzDaoByZNA(
      ZNAClient.zNATozNAId(zNA)
    );

    // resolve all the zNAIds
    const promises: Promise<zNAId>[] = [];
    for (const zNAId of zDAORecord.associatedzNAs) {
      promises.push(ZNAClient.zNAIdTozNA(zNAId.toHexString()));
    }
    const zNAs: zNA[] = await Promise.all(promises);

    return {
      id: zDAORecord.id.toString(),
      zDAO: zDAORecord.zDAO,
      zNAs,
    };
  }

  async getZDAORecordById(zDAOId: zDAOId): Promise<ZDAORecord> {
    const zDAORecord = await this._contract.getzDAOById(zDAOId);

    // resolve all the zNAIds
    const promises: Promise<zNAId>[] = [];
    for (const zNAId of zDAORecord.associatedzNAs) {
      promises.push(ZNAClient.zNAIdTozNA(zNAId.toHexString()));
    }
    const zNAs: zNA[] = await Promise.all(promises);

    return {
      id: zDAORecord.id.toString(),
      zDAO: zDAORecord.zDAO,
      zNAs,
    };
  }

  async listzDAOs(): Promise<ZDAORecord[]> {
    const count = 100;
    let from = 0;
    let numberOfReturns = count;
    const zDAORecord: ZDAORecord[] = [];

    while (numberOfReturns === count) {
      const response = await this._contract.listzDAOs(from, count);

      for (const record of response) {
        const zNAs: string[] = [];
        const promises: Promise<zNA>[] = [];
        const zNAIds: string[] = record.associatedzNAs.map(
          (associated: ethers.BigNumber) => associated.toString()
        );
        for (const zNAId of zNAIds) {
          promises.push(
            ZNAClient.zNAIdTozNA(ethers.BigNumber.from(zNAId).toHexString())
          );
        }
        const result: zNA[] = await Promise.all(promises);
        zNAs.push(...result);

        zDAORecord.push({
          id: record.id.toString(),
          zDAO: record.zDAO,
          zNAs,
        });
      }
      numberOfReturns = response.length;
      from += response.length;
    }
    return zDAORecord;
  }

  async doeszDAOExistForzNA(zNA: zNA): Promise<boolean> {
    return this._contract.doeszDAOExistForzNA(ZNAClient.zNATozNAId(zNA));
  }

  async getZDAOByZNA(zNA: zNA): Promise<EtherZDAO> {
    const zDAORecord = await this._contract.getzDaoByZNA(
      ZNAClient.zNATozNAId(zNA)
    );

    return new ethers.Contract(
      zDAORecord.zDAO,
      EtherZDAOAbi.abi,
      GlobalClient.etherRpcProvider
    ) as EtherZDAO;
  }

  async getZDAOById(zDAOId: zDAOId): Promise<EtherZDAO> {
    const zDAORecord = await this._contract.getzDAOById(zDAOId);

    return new ethers.Contract(
      zDAORecord.zDAO,
      EtherZDAOAbi.abi,
      GlobalClient.etherRpcProvider
    ) as EtherZDAO;
  }

  async getZDAOPropertiesById(zDAOId: zDAOId): Promise<EtherZDAOProperties> {
    const zDAORecord = await this.getZDAORecordById(zDAOId);

    const etherZDAO = new ethers.Contract(
      zDAORecord.zDAO,
      EtherZDAOAbi.abi,
      GlobalClient.etherRpcProvider
    ) as EtherZDAO;

    const zDAOInfo = await etherZDAO.zDAOInfo();

    const token = await getToken(GlobalClient.etherRpcProvider, zDAOInfo.token);

    return {
      id: zDAOInfo.zDAOId.toString(),
      address: zDAORecord.zDAO,
      zNAs: zDAORecord.zNAs,
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
    const gasEstimated = await this._contract
      .connect(signer)
      .estimateGas.addNewDAO(payload.zNA, {
        title: payload.title,
        gnosisSafe: payload.gnosisSafe,
        token: payload.token,
        amount: payload.amount,
        duration: payload.duration,
        votingThreshold: payload.votingThreshold,
        minimumVotingParticipants: payload.minimumVotingParticipants,
        minimumTotalVotingTokens: payload.minimumTotalVotingTokens,
        isRelativeMajority: payload.isRelativeMajority,
      });

    const tx = await this._contract.connect(signer).addNewDAO(
      payload.zNA,
      {
        title: payload.title,
        gnosisSafe: payload.gnosisSafe,
        token: payload.token,
        amount: payload.amount,
        duration: payload.duration,
        votingThreshold: payload.votingThreshold,
        minimumVotingParticipants: payload.minimumVotingParticipants,
        minimumTotalVotingTokens: payload.minimumTotalVotingTokens,
        isRelativeMajority: payload.isRelativeMajority,
      },
      {
        gasLimit: calculateGasMargin(gasEstimated),
      }
    );
    return await tx.wait();
  }

  async removeDAO(signer: ethers.Signer, zDAOId: zDAOId) {
    const tx = await this._contract.connect(signer).removeDAO(zDAOId);
    return await tx.wait();
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

export default EtherZDAOChefClient;
