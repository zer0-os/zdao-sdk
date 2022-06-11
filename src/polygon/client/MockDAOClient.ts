import { ethers } from 'ethers';
import shortid from 'shortid';

import { GnosisSafeClient } from '../../client';
import {
  CreateProposalParams,
  CreateZDAOParams,
  NotFoundError,
  NotImplementedError,
  Proposal,
  ProposalId,
  ProposalProperties,
  ProposalState,
  zDAO,
  zDAOProperties,
  zDAOState,
} from '../../types';
import { errorMessageForError, getToken, timestamp } from '../../utilities';
import IERC20UpgradeableAbi from '../config/abi/IERC20Upgradeable.json';
import { Config, VoteChoice } from '../types';
import AbstractDAOClient from './AbstractDAOClient';
import GlobalClient from './GlobalClient';
import MockProposalClient from './MockProposalClient';

class MockDAOClient extends AbstractDAOClient {
  private _proposals: MockProposalClient[] = [];
  protected _totalSupply: ethers.BigNumber;

  private constructor(
    properties: zDAOProperties,
    gnosisSafeClient: GnosisSafeClient,
    totalSupply: ethers.BigNumber
  ) {
    super(properties, gnosisSafeClient);
    this._totalSupply = totalSupply;
  }

  get totalSupply() {
    return this._totalSupply;
  }

  static async createInstance(
    config: Config,
    signer: ethers.Signer,
    params: CreateZDAOParams
  ): Promise<zDAO> {
    const chainId = await signer.getChainId();

    const token = await getToken(GlobalClient.etherRpcProvider, params.token);
    const childTokenAddress = await GlobalClient.registry.rootToChildToken(
      params.token
    );
    const childToken = await getToken(
      GlobalClient.polyRpcProvider,
      childTokenAddress
    );

    const properties: zDAOProperties = {
      id: shortid.generate(),
      zNAs: [params.zNA],
      title: params.title,
      createdBy: await signer.getAddress(),
      network: chainId,
      gnosisSafe: params.gnosisSafe,
      votingToken: token,
      amount: params.amount,
      duration: params.duration,
      votingThreshold: params.votingThreshold,
      minimumVotingParticipants: params.minimumVotingParticipants,
      minimumTotalVotingTokens: params.minimumTotalVotingTokens,
      isRelativeMajority: params.isRelativeMajority,
      state: zDAOState.ACTIVE,
      snapshot: timestamp(new Date()),
      destroyed: false,
      options: {
        polygonToken: childToken,
      },
    };

    const tokenContract = new ethers.Contract(
      params.token,
      IERC20UpgradeableAbi.abi,
      GlobalClient.etherRpcProvider
    );

    const totalSupply = await tokenContract.totalSupply();

    return new MockDAOClient(
      properties,
      new GnosisSafeClient(config.gnosisSafe, config.ipfsGateway),
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
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    payload: CreateProposalParams
  ): Promise<ProposalId> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const signer = provider?.getSigner ? provider.getSigner() : provider;
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
      created: now,
      start: now,
      end: new Date(now.getTime() + this.duration * 1000),
      state: ProposalState.ACTIVE,
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

  syncState(_: ethers.Signer, _2: string): Promise<void> {
    throw new NotImplementedError();
  }
}

export default MockDAOClient;
