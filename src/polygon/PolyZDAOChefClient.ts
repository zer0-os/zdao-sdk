import { AddressZero } from '@ethersproject/constants';
import { BigNumber, ethers } from 'ethers';

import PolyZDAOAbi from '../config/abi/PolyZDAO.json';
import PolyZDAOChefAbi from '../config/abi/PolyZDAOChef.json';
import { PolyZDAO } from '../config/types/PolyZDAO';
import { PolyZDAOChef } from '../config/types/PolyZDAOChef';
import { Choice, DAOConfig, ProposalId, zDAOId } from '../types';
import { PolyZDAOProperties } from './types';

class PolyZDAOChefClient {
  private readonly _config: DAOConfig;
  protected readonly _contract: PolyZDAOChef;

  constructor(config: DAOConfig) {
    this._config = config;
    this._contract = new ethers.Contract(
      config.zDAOChef,
      PolyZDAOChefAbi.abi,
      config.provider
    ) as PolyZDAOChef;
  }

  get config(): DAOConfig {
    return this._config;
  }

  async numberOfzDAOs(): Promise<number> {
    return (await this._contract.numberOfzDAOs()).toNumber();
  }

  async getZDAOById(daoId: zDAOId): Promise<PolyZDAO | null> {
    const iPolyZDAO = await this._contract.getzDAOById(daoId);
    if (!iPolyZDAO || iPolyZDAO === AddressZero) return null;

    return new ethers.Contract(
      iPolyZDAO,
      PolyZDAOAbi.abi,
      this._config.provider
    ) as PolyZDAO;
  }

  async getZDAOProperties(daoId: zDAOId): Promise<PolyZDAOProperties> {
    const address = await this._contract.getzDAOById(daoId);
    const polyZDAO = new ethers.Contract(
      address,
      PolyZDAOAbi.abi,
      this._config.provider
    ) as PolyZDAO;

    const zDAOInfo = await polyZDAO.zDAOInfo();

    return {
      id: zDAOInfo.zDAOId.toString(),
      address: polyZDAO.address,
      snapshot: zDAOInfo.snapshot.toNumber(),
      destroyed: zDAOInfo.destroyed,
    };
  }

  async vote(
    signer: ethers.Wallet,
    daoId: zDAOId,
    proposalId: ProposalId,
    choice: Choice
  ) {
    const tx = await this._contract
      .connect(signer)
      .vote(daoId, proposalId, choice);
    return await tx.wait();
  }

  async collectProposal(
    signer: ethers.Wallet,
    daoId: zDAOId,
    proposalId: ProposalId
  ) {
    const tx = await this._contract
      .connect(signer)
      .collectProposal(daoId, proposalId);
    return await tx.wait();
  }

  async collectTxHash(
    daoId: zDAOId,
    proposalId: ProposalId
  ): Promise<string[]> {
    const currentBlock = await this._config.provider.getBlockNumber();
    console.log('currentBlock', currentBlock);

    const creationBlock = this._config.blockNumber;
    console.log('creationBlock', creationBlock);

    // event ProposalCollected(
    //   uint256 indexed _zDAOId,
    //   uint256 indexed _proposalId,
    //   uint256 _voters,
    //   uint256 _yes,
    //   uint256 _no
    // )

    const filter = this._contract.filters.ProposalCollected(
      BigNumber.from(daoId),
      BigNumber.from(proposalId)
    );
    const events = await this._contract.queryFilter(
      filter,
      creationBlock,
      currentBlock
    );

    return events.map((event) => event.transactionHash);
  }
}

export default PolyZDAOChefClient;
