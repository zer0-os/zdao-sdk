import { BigNumber, ethers } from 'ethers';

import ZNAClient from '../client/ZNAClient';
import EtherZDAOAbi from '../config/abi/EtherZDAO.json';
import EtherZDAOChefAbi from '../config/abi/EtherZDAOChef.json';
import { EtherZDAO } from '../config/types/EtherZDAO';
import { EtherZDAOChef } from '../config/types/EtherZDAOChef';
import {
  CreateProposalParams,
  CreateZDAOParams,
  DAOConfig,
  ProposalId,
  zDAOId,
  zNA,
  zNAId,
} from '../types';
import { calculateGasMargin } from '../utilities/tx';
import { EtherZDAOProperties, ZDAORecord } from './types';

class EtherZDAOChefClient {
  private readonly _config: DAOConfig;
  protected readonly _contract: EtherZDAOChef;

  constructor(config: DAOConfig) {
    this._config = config;
    this._contract = new ethers.Contract(
      config.zDAOChef,
      EtherZDAOChefAbi.abi,
      config.provider
    ) as EtherZDAOChef;
  }

  get config(): DAOConfig {
    return this._config;
  }

  async numberOfzDAOs(): Promise<number> {
    return (await this._contract.numberOfzDAOs()).toNumber();
  }

  async getZDAORecordByZNA(zNA: zNA): Promise<ZDAORecord> {
    const zDAORecord = await this._contract.getzDaoByZNA(zNA);

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
          (associated: BigNumber) => associated.toString()
        );
        for (const zNAId of zNAIds) {
          promises.push(
            ZNAClient.zNAIdTozNA(BigNumber.from(zNAId).toHexString())
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
      this._config.provider
    ) as EtherZDAO;
  }

  async getZDAOById(zDAOId: zDAOId): Promise<EtherZDAO> {
    const zDAORecord = await this._contract.getzDAOById(zDAOId);

    return new ethers.Contract(
      zDAORecord.zDAO,
      EtherZDAOAbi.abi,
      this._config.provider
    ) as EtherZDAO;
  }

  async getZDAOPropertiesByZNA(zNA: zNA): Promise<EtherZDAOProperties> {
    const zDAORecord = await this.getZDAORecordByZNA(ZNAClient.zNATozNAId(zNA));

    const etherZDAO = new ethers.Contract(
      zDAORecord.zDAO,
      EtherZDAOAbi.abi,
      this._config.provider
    ) as EtherZDAO;

    const { chainId } = await this._config.provider.getNetwork();

    const zDAOInfo = await etherZDAO.zDAOInfo();

    return {
      id: zDAOInfo.zDAOId.toString(),
      address: zDAORecord.zDAO,
      zNAs: zDAORecord.zNAs,
      title: zDAOInfo.title,
      createdBy: zDAOInfo.createdBy,
      network: chainId,
      gnosisSafe: zDAOInfo.gnosisSafe,
      token: zDAOInfo.token,
      amount: zDAOInfo.amount.toString(),
      threshold: zDAOInfo.threshold.toNumber(),
      quorumParticipants: zDAOInfo.quorumParticipants.toNumber(),
      quorumVotes: zDAOInfo.quorumVotes.toString(),
      snapshot: zDAOInfo.snapshot.toNumber(),
      isRelativeMajority: zDAOInfo.isRelativeMajority,
      destroyed: zDAOInfo.destroyed,
    };
  }

  async addNewDAO(signer: ethers.Wallet, payload: CreateZDAOParams) {
    const gasEstimated = await this._contract
      .connect(signer)
      .estimateGas.addNewDAO(payload.zNA, {
        title: payload.title,
        gnosisSafe: payload.gnosisSafe,
        token: payload.token,
        amount: payload.amount,
        threshold: payload.threshold,
        quorumParticipants: payload.quorumParticipants,
        quorumVotes: payload.quorumVotes,
        isRelativeMajority: payload.isRelativeMajority,
      });

    const tx = await this._contract.connect(signer).addNewDAO(
      payload.zNA,
      {
        title: payload.title,
        gnosisSafe: payload.gnosisSafe,
        token: payload.token,
        amount: payload.amount,
        threshold: payload.threshold,
        quorumParticipants: payload.quorumParticipants,
        quorumVotes: payload.quorumVotes,
        isRelativeMajority: payload.isRelativeMajority,
      },
      {
        gasLimit: calculateGasMargin(gasEstimated),
      }
    );
    return await tx.wait();
  }

  async removeDAO(signer: ethers.Wallet, zDAOId: zDAOId) {
    const tx = await this._contract.connect(signer).removeDAO(zDAOId);
    return await tx.wait();
  }

  async createProposal(
    signer: ethers.Wallet,
    zDAOId: zDAOId,
    payload: CreateProposalParams,
    ipfs: string
  ) {
    const gasEstimated = await this._contract
      .connect(signer)
      .estimateGas.createProposal(
        zDAOId,
        payload.duration,
        payload.transfer.sender, // target
        '0', // value
        '0x00', // data
        ipfs
      );

    const tx = await this._contract.connect(signer).createProposal(
      zDAOId,
      payload.duration,
      payload.transfer.sender, // target
      '0', // value
      '0x00', // data
      ipfs,
      {
        gasLimit: calculateGasMargin(gasEstimated),
      }
    );
    return await tx.wait();
  }

  async cancelProposal(
    signer: ethers.Wallet,
    zDAOId: zDAOId,
    proposalId: ProposalId
  ) {
    const tx = await this._contract
      .connect(signer)
      .cancelProposal(zDAOId, proposalId);
    return await tx.wait();
  }

  async executeProposal(
    signer: ethers.Wallet,
    zDAOId: zDAOId,
    proposalId: ProposalId
  ) {
    const tx = await this._contract
      .connect(signer)
      .executeProposal(zDAOId, proposalId);
    return await tx.wait();
  }
}

export default EtherZDAOChefClient;
