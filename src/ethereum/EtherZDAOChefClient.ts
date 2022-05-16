import { BigNumber, ethers, Signer } from 'ethers';

import ZNAClient from '../client/ZNAClient';
import EtherZDAOAbi from '../config/abi/EtherZDAO.json';
import EtherZDAOChefAbi from '../config/abi/EtherZDAOChef.json';
import FxStateRootTunnelAbi from '../config/abi/FxStateRootTunnel.json';
import { EtherZDAO } from '../config/types/EtherZDAO';
import { EtherZDAOChef } from '../config/types/EtherZDAOChef';
import { FxStateRootTunnel } from '../config/types/FxStateRootTunnel';
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
  protected _contract!: EtherZDAOChef;
  protected _rootStateSender!: FxStateRootTunnel;

  constructor(config: DAOConfig) {
    this._config = config;

    return (async (): Promise<EtherZDAOChefClient> => {
      this._contract = new ethers.Contract(
        config.zDAOChef,
        EtherZDAOChefAbi.abi,
        new ethers.providers.JsonRpcProvider(config.rpcUrl, config.network)
      ) as EtherZDAOChef;

      const address = await this._contract.rootStateSender();
      this._rootStateSender = new ethers.Contract(
        address,
        FxStateRootTunnelAbi.abi,
        new ethers.providers.JsonRpcProvider(config.rpcUrl, config.network)
      ) as FxStateRootTunnel;

      return this;
    })() as unknown as EtherZDAOChefClient;
  }

  get config(): DAOConfig {
    return this._config;
  }

  stateSender(): Promise<string> {
    return this._contract.rootStateSender();
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
      new ethers.providers.JsonRpcProvider(
        this._config.rpcUrl,
        this._config.network
      )
    ) as EtherZDAO;
  }

  async getZDAOById(zDAOId: zDAOId): Promise<EtherZDAO> {
    const zDAORecord = await this._contract.getzDAOById(zDAOId);

    return new ethers.Contract(
      zDAORecord.zDAO,
      EtherZDAOAbi.abi,
      new ethers.providers.JsonRpcProvider(
        this._config.rpcUrl,
        this._config.network
      )
    ) as EtherZDAO;
  }

  async getZDAOPropertiesByZNA(zNA: zNA): Promise<EtherZDAOProperties> {
    const zDAORecord = await this.getZDAORecordByZNA(ZNAClient.zNATozNAId(zNA));

    const etherZDAO = new ethers.Contract(
      zDAORecord.zDAO,
      EtherZDAOAbi.abi,
      new ethers.providers.JsonRpcProvider(
        this._config.rpcUrl,
        this._config.network
      )
    ) as EtherZDAO;

    const zDAOInfo = await etherZDAO.zDAOInfo();

    return {
      id: zDAOInfo.zDAOId.toString(),
      address: zDAORecord.zDAO,
      zNAs: zDAORecord.zNAs,
      title: zDAOInfo.title,
      createdBy: zDAOInfo.createdBy,
      network: this._config.network,
      gnosisSafe: zDAOInfo.gnosisSafe,
      token: zDAOInfo.token,
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

  async addNewDAO(signer: Signer, payload: CreateZDAOParams) {
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

  async removeDAO(signer: Signer, zDAOId: zDAOId) {
    const tx = await this._contract.connect(signer).removeDAO(zDAOId);
    return await tx.wait();
  }

  async createProposal(
    signer: Signer,
    zDAOId: zDAOId,
    payload: CreateProposalParams,
    ipfs: string
  ) {
    const gasEstimated = await this._contract
      .connect(signer)
      .estimateGas.createProposal(
        zDAOId,
        payload.transfer.sender, // target
        '0', // value
        '0x00', // data
        ipfs
      );

    const tx = await this._contract.connect(signer).createProposal(
      zDAOId,
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

  async cancelProposal(signer: Signer, zDAOId: zDAOId, proposalId: ProposalId) {
    const tx = await this._contract
      .connect(signer)
      .cancelProposal(zDAOId, proposalId);
    return await tx.wait();
  }

  async executeProposal(
    signer: Signer,
    zDAOId: zDAOId,
    proposalId: ProposalId
  ) {
    const tx = await this._contract
      .connect(signer)
      .executeProposal(zDAOId, proposalId);
    return await tx.wait();
  }

  async receiveMessage(signer: Signer, proof: string) {
    const tx = await this._rootStateSender
      .connect(signer)
      .receiveMessage(proof);
    return await tx.wait();
  }
}

export default EtherZDAOChefClient;
