import { BigNumber, ethers } from 'ethers';
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
    signer: ethers.Wallet,
    params: CreateZDAOParams
  ): Promise<MockDAOClient> {
    const { chainId } = await signer.provider.getNetwork();

    const properties: zDAOProperties = {
      id: shortid.generate(),
      zNAs: [params.zNA],
      title: params.title,
      createdBy: signer.address,
      network: chainId,
      gnosisSafe: params.gnosisSafe,
      token: params.token,
      amount: params.amount,
      threshold: params.threshold,
      quorumParticipants: params.quorumParticipants,
      quorumVotes: params.quorumVotes,
      snapshot: timestamp(new Date()),
      isRelativeMajority: params.isRelativeMajority,
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
    signer: ethers.Wallet,
    payload: CreateProposalParams
  ): Promise<Proposal> {
    const ipfs = await this.uploadToIPFS(signer, payload, signer.address);

    const now = new Date();

    const properties: ProposalProperties = {
      id: (this._proposals.length + 1).toString(),
      createdBy: signer.address,
      title: payload.title,
      body: payload.body,
      ipfs,
      choices: Object.values(VoteChoice),
      start: now,
      end: new Date(now.getTime() + payload.duration * 1000),
      state: 'active',
      snapshot: timestamp(now),
      scores: ['0', '0'],
      voters: 0,
      metadata: undefined,
    };
    this._proposals.push(new MockProposalClient(properties, this));

    return Promise.resolve(this._proposals[this._proposals.length - 1]);
  }

  isCheckPointed(_: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  syncState(_: ethers.Wallet, _2: string): Promise<ethers.ContractReceipt> {
    throw new NotImplementedError();
  }
}

export default MockDAOClient;
