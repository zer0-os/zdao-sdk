import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';
import shortid from 'shortid';

import { AbstractDAOClient, GnosisSafeClient } from '../../client';
import IERC20UpgradeableAbi from '../../config/abi/IERC20Upgradeable.json';
import {
  NotFoundError,
  ProposalId,
  ProposalProperties,
  ProposalState,
  zDAOProperties,
  zDAOState,
} from '../../types';
import {
  errorMessageForError,
  getSigner,
  getToken,
  timestamp,
} from '../../utilities';
import {
  CreatePolygonProposalParams,
  CreatePolygonZDAOParams,
  PolygonConfig,
  PolygonProposal,
  PolygonVote,
  PolygonZDAO,
  VoteChoice,
  zDAOOptions,
} from '../types';
import GlobalClient from './GlobalClient';
import MockProposalClient from './MockProposalClient';

class MockDAOClient
  extends AbstractDAOClient<PolygonVote, PolygonProposal>
  implements PolygonZDAO
{
  protected readonly _zDAOOptions: zDAOOptions;
  private _proposals: MockProposalClient[] = [];
  protected _totalSupply: ethers.BigNumber;

  private constructor(
    properties: zDAOProperties & zDAOOptions,
    gnosisSafeClient: GnosisSafeClient,
    totalSupply: ethers.BigNumber
  ) {
    super(properties, gnosisSafeClient);
    this._zDAOOptions = cloneDeep(properties);
    this._totalSupply = totalSupply;
  }

  get polygonToken() {
    return this._zDAOOptions.polygonToken;
  }

  get totalSupply() {
    return this._totalSupply;
  }

  static async createInstance(
    config: PolygonConfig,
    signer: ethers.Signer,
    params: CreatePolygonZDAOParams
  ): Promise<PolygonZDAO> {
    const chainId = await signer.getChainId();

    const token = await getToken(GlobalClient.etherRpcProvider, params.token);
    const polygonTokenAddress =
      await GlobalClient.registry.ethereumToPolygonToken(params.token);
    const polygonToken = await getToken(
      GlobalClient.polyRpcProvider,
      polygonTokenAddress
    );

    const properties: zDAOProperties & zDAOOptions = {
      id: shortid.generate(),
      zNAs: [params.zNA],
      name: params.name,
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
      polygonToken: polygonToken,
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

  listProposals(): Promise<PolygonProposal[]> {
    return Promise.resolve(this._proposals);
  }

  getProposal(proposalId: ProposalId): Promise<PolygonProposal> {
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
    account: string | undefined,
    payload: CreatePolygonProposalParams
  ): Promise<ProposalId> {
    const signer = getSigner(provider, account);
    const address = account ?? (await signer.getAddress());
    const ipfs = await AbstractDAOClient.uploadToIPFS(signer, payload);

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
      metadata: payload.transfer,
    };
    this._proposals.push(new MockProposalClient(properties, this));

    return Promise.resolve(properties.id);
  }

  isCheckPointed(_: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}

export default MockDAOClient;
