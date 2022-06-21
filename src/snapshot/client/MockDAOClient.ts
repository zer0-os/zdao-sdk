import { ethers } from 'ethers';
import shortid from 'shortid';

import { AbstractDAOClient, GnosisSafeClient } from '../../client';
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
import {
  Config,
  CreateProposalParamsOptions,
  CreateZDAOParamsOptions,
} from '../types';
import GlobalClient from './GlobalClient';
import MockProposalClient from './MockProposalClient';

class MockDAOClient extends AbstractDAOClient {
  private _proposals: MockProposalClient[] = [];

  private constructor(
    properties: zDAOProperties,
    gnosisSafeClient: GnosisSafeClient
  ) {
    super(properties, gnosisSafeClient);
  }

  static async createInstance(
    config: Config,
    signer: ethers.Signer,
    params: CreateZDAOParams
  ): Promise<zDAO> {
    const token = await getToken(GlobalClient.etherRpcProvider, params.token);
    const snapshot = await GlobalClient.etherRpcProvider.getBlockNumber();

    const properties: zDAOProperties = {
      id: shortid.generate(),
      zNAs: [params.zNA],
      name: params.name,
      createdBy: '',
      network: params.network,
      gnosisSafe: params.gnosisSafe,
      votingToken: token,
      amount: '0',
      duration: params.duration,
      votingThreshold: 5001,
      minimumVotingParticipants: 0,
      minimumTotalVotingTokens: '0',
      isRelativeMajority: false,
      state: zDAOState.ACTIVE,
      snapshot,
      destroyed: false,
      options: {
        ens: (params.options as unknown as CreateZDAOParamsOptions).ens,
      },
    };

    return new MockDAOClient(
      properties,
      new GnosisSafeClient(config.gnosisSafe, config.ipfsGateway)
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
    const ipfs = await AbstractDAOClient.uploadToIPFS(signer, payload);

    const now = new Date();

    const properties: ProposalProperties = {
      id: (this._proposals.length + 1).toString(),
      createdBy: address,
      title: payload.title,
      body: payload.body,
      ipfs,
      choices: (payload.options as CreateProposalParamsOptions).choices,
      created: now,
      start: now,
      end: new Date(now.getTime() + this.duration * 1000),
      state: ProposalState.ACTIVE,
      snapshot: timestamp(now),
      scores: (payload.options as CreateProposalParamsOptions).choices.map(
        (_) => '0'
      ),
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
