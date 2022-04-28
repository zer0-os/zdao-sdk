import { addSeconds } from 'date-fns';
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
import { timestamp } from '../utilities/date';
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

  async listzDAOs(): Promise<ZDAORecord[]> {
    const count = await this.numberOfzDAOs();
    const limit = 100;
    let from = 1;
    let numberOfReturns = limit;
    const zDAORecord: ZDAORecord[] = [];

    while (numberOfReturns === limit) {
      const response = await this._contract.listzDAOs(
        from,
        from + Math.min(limit, count) - 1
      );

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

  async getZDAOById(daoId: zDAOId): Promise<EtherZDAO> {
    const zDAORecord = await this._contract.getzDAOById(daoId);

    return new ethers.Contract(
      zDAORecord.zDAO,
      EtherZDAOAbi.abi,
      this._config.provider
    ) as EtherZDAO;
  }

  async getZDAOProperties(zNA: zNA): Promise<EtherZDAOProperties> {
    const zDAORecord = await this.getZDAORecordByZNA(zNA);

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
      isRelativeMajority: zDAOInfo.isRelativeMajority,
      quorumVotes: zDAOInfo.quorumVotes.toString(),
      snapshot: zDAOInfo.snapshot.toNumber(),
      destroyed: zDAOInfo.destroyed,
    };
  }

  addNewDAO(signer: ethers.Wallet, payload: CreateZDAOParams) {
    return this._contract.connect(signer).addNewDAO(payload.zNA, {
      title: payload.title,
      gnosisSafe: payload.gnosisSafe,
      token: payload.token,
      amount: payload.amount,
      isRelativeMajority: payload.isRelativeMajority,
      quorumVotes: payload.quorumVotes,
    });
  }

  removeDAO(signer: ethers.Wallet, daoId: zDAOId) {
    return this._contract.connect(signer).removeDAO(daoId);
  }

  createProposal(
    signer: ethers.Wallet,
    daoId: zDAOId,
    payload: CreateProposalParams
  ) {
    // todo, submit proposal meta data to ipfs and compact into byte32
    const ipfs =
      '0x0170171c23281b16a3c58934162488ad6d039df686eca806f21eba0cebd03486';

    const startDateTime = new Date();

    return this._contract.connect(signer).createProposal(
      daoId,
      timestamp(startDateTime),
      timestamp(addSeconds(startDateTime, payload.duration)),
      payload.transfer.token, // target
      payload.transfer.amount, // value
      '', // data
      ipfs
    );
  }

  cancelProposal(signer: ethers.Wallet, daoId: zDAOId, proposalId: ProposalId) {
    return this._contract.connect(signer).cancelProposal(daoId, proposalId);
  }

  executeProposal(
    signer: ethers.Wallet,
    daoId: zDAOId,
    proposalId: ProposalId
  ) {
    return this._contract.connect(signer).executeProposal(daoId, proposalId);
  }
}

export default EtherZDAOChefClient;
