import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';
import shortid from 'shortid';

import { AbstractDAOClient, GnosisSafeClient } from '../../client';
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
  getTotalSupply,
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
  protected readonly zDAOOptions: zDAOOptions;
  private proposals: MockProposalClient[] = [];

  private constructor(
    properties: zDAOProperties & zDAOOptions,
    gnosisSafeClient: GnosisSafeClient
  ) {
    super(properties, gnosisSafeClient);
    this.zDAOOptions = cloneDeep(properties);
  }

  get polygonToken() {
    return this.zDAOOptions.polygonToken;
  }

  static async createInstance(
    config: PolygonConfig,
    signer: ethers.Signer,
    params: CreatePolygonZDAOParams
  ): Promise<PolygonZDAO> {
    const polygonTokenAddress =
      await GlobalClient.registry.ethereumToPolygonToken(params.votingToken);

    const results = await Promise.all([
      signer.getChainId(),
      getToken(GlobalClient.etherRpcProvider, params.votingToken),
      getTotalSupply(GlobalClient.etherRpcProvider, params.votingToken),
      getToken(GlobalClient.polyRpcProvider, polygonTokenAddress),
    ]);

    const properties: zDAOProperties & zDAOOptions = {
      id: shortid.generate(),
      zNAs: [params.zNA],
      name: params.name,
      createdBy: await signer.getAddress(),
      network: results[0],
      gnosisSafe: params.gnosisSafe,
      votingToken: results[1],
      minimumVotingTokenAmount: params.minimumVotingTokenAmount,
      totalSupplyOfVotingToken: results[2].toString(),
      votingDuration: params.votingDuration,
      votingDelay: params.votingDelay ?? 0,
      votingThreshold: params.votingThreshold,
      minimumVotingParticipants: params.minimumVotingParticipants,
      minimumTotalVotingTokens: params.minimumTotalVotingTokens,
      isRelativeMajority: params.isRelativeMajority,
      state: zDAOState.ACTIVE,
      snapshot: timestamp(new Date()),
      destroyed: false,
      polygonToken: results[3],
    };

    return new MockDAOClient(
      properties,
      new GnosisSafeClient(config.gnosisSafe, config.ipfsGateway)
    );
  }

  listProposals(): Promise<PolygonProposal[]> {
    return Promise.resolve(this.proposals);
  }

  getProposal(proposalId: ProposalId): Promise<PolygonProposal> {
    const found = this.proposals.find((proposal) => proposal.id === proposalId);
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
      id: (this.proposals.length + 1).toString(),
      createdBy: address,
      title: payload.title,
      body: payload.body,
      ipfs,
      choices: [VoteChoice.YES, VoteChoice.NO],
      created: now,
      start: now,
      end: new Date(now.getTime() + this.votingDuration * 1000),
      state: ProposalState.ACTIVE,
      snapshot: timestamp(now),
      scores: ['0', '0'],
      voters: 0,
      metadata: payload.transfer,
    };
    this.proposals.push(new MockProposalClient(properties, this));

    return Promise.resolve(properties.id);
  }

  isCheckPointed(_: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}

export default MockDAOClient;
