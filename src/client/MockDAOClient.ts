import { BigNumber, ethers, Signer } from 'ethers';
import shortid from 'shortid';

import IERC20UpgradeableAbi from '../config/abi/IERC20Upgradeable.json';
import { GnosisSafeClient } from '../gnosis-safe';
import {
  Config,
  CreateProposalParams,
  CreateZDAOParams,
  Proposal,
  ProposalId,
  ProposalProperties,
  Registry,
  VoteChoice,
  zDAOProperties,
} from '../types';
import { NotFoundError, NotImplementedError } from '../types/error';
import { errorMessageForError } from '../utilities/messages';
import { timestamp } from '../utilities/tx';
import AbstractDAOClient from './AbstractDAOClient';
import MockProposalClient from './MockProposalClient';

class MockDAOClient extends AbstractDAOClient {
  private _proposals: MockProposalClient[] = [];
  protected _totalSupply: BigNumber;

  private constructor(
    properties: zDAOProperties,
    gnosisSafeClient: GnosisSafeClient,
    totalSupply: BigNumber
  ) {
    super(properties, gnosisSafeClient);
    this._totalSupply = totalSupply;
  }

  get totalSupply() {
    return this._totalSupply;
  }

  static async createInstance(
    config: Config,
    signer: Signer,
    params: CreateZDAOParams,
    registry: Registry
  ): Promise<MockDAOClient> {
    const chainId = await signer.getChainId();

    const properties: zDAOProperties = {
      id: shortid.generate(),
      zNAs: [params.zNA],
      title: params.title,
      createdBy: await signer.getAddress(),
      network: chainId,
      gnosisSafe: params.gnosisSafe,
      rootToken: params.token,
      amount: params.amount,
      childToken: await registry.rootToChildToken(params.token),
      duration: params.duration,
      votingThreshold: params.votingThreshold,
      minimumVotingParticipants: params.minimumVotingParticipants,
      minimumTotalVotingTokens: params.minimumTotalVotingTokens,
      isRelativeMajority: params.isRelativeMajority,
      state: 'active',
      snapshot: timestamp(new Date()),
      destroyed: false,
    };

    const tokenContract = new ethers.Contract(
      params.token,
      IERC20UpgradeableAbi.abi,
      new ethers.providers.JsonRpcProvider(
        config.ethereum.rpcUrl,
        config.ethereum.network
      )
    );

    const totalSupply = await tokenContract.totalSupply();

    return new MockDAOClient(
      properties,
      new GnosisSafeClient(config.gnosisSafe),
      totalSupply
    );
  }

  listProposals(): Promise<Proposal[]> {
    return Promise.resolve(this._proposals);
  }

  getProposal(proposalId: ProposalId): Promise<Proposal> {
    const found = this._proposals.find(
      (proposal) => proposal.id === proposalId
    );
    if (!found) {
      throw new NotFoundError(errorMessageForError('not-found-proposal'));
    }

    return Promise.resolve(found);
  }

  async createProposal(
    signer: Signer,
    payload: CreateProposalParams
  ): Promise<ProposalId> {
    const address = await signer.getAddress();
    const ipfs = await this.uploadToIPFS(signer, payload);

    const now = new Date();

    const properties: ProposalProperties = {
      id: (this._proposals.length + 1).toString(),
      createdBy: address,
      title: payload.title,
      body: payload.body,
      ipfs,
      choices: [VoteChoice.YES, VoteChoice.NO],
      start: now,
      end: new Date(now.getTime() + this.duration * 1000),
      state: 'active',
      snapshot: timestamp(now),
      scores: ['0', '0'],
      voters: 0,
      metadata: undefined,
    };
    this._proposals.push(new MockProposalClient(properties, this));

    return Promise.resolve(properties.id);
  }

  isCheckPointed(_: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  syncState(_: Signer, _2: string): Promise<ethers.ContractReceipt> {
    throw new NotImplementedError();
  }
}

export default MockDAOClient;
