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
  timestamp,
} from '../../utilities';
import {
  CreateSnapshotProposalParams,
  CreateSnapshotZDAOParams,
  SnapshotConfig,
  SnapshotProposal,
  SnapshotVote,
  SnapshotZDAO,
  zDAOOptions,
} from '../types';
import GlobalClient from './GlobalClient';
import MockProposalClient from './MockProposalClient';

class MockDAOClient
  extends AbstractDAOClient<SnapshotVote, SnapshotProposal>
  implements SnapshotZDAO
{
  protected readonly _zDAOOptions: zDAOOptions;
  private _proposals: MockProposalClient[] = [];

  private constructor(
    properties: zDAOProperties & zDAOOptions,
    gnosisSafeClient: GnosisSafeClient
  ) {
    super(properties, gnosisSafeClient);
    this._zDAOOptions = cloneDeep(properties);
  }

  get ens() {
    return this._zDAOOptions.ens;
  }

  static async createInstance(
    config: SnapshotConfig,
    signer: ethers.Signer,
    params: CreateSnapshotZDAOParams
  ): Promise<SnapshotZDAO> {
    const token = await getToken(GlobalClient.etherRpcProvider, params.token);
    const snapshot = await GlobalClient.etherRpcProvider.getBlockNumber();

    const properties: zDAOProperties & zDAOOptions = {
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
      ens: params.ens,
    };

    return new MockDAOClient(
      properties,
      new GnosisSafeClient(config.gnosisSafe, config.ipfsGateway)
    );
  }

  listProposals(): Promise<SnapshotProposal[]> {
    return Promise.resolve(this._proposals);
  }

  getProposal(proposalId: ProposalId): Promise<SnapshotProposal> {
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
    payload: CreateSnapshotProposalParams
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
      choices: payload.choices,
      created: now,
      start: now,
      end: new Date(now.getTime() + this.duration * 1000),
      state: ProposalState.ACTIVE,
      snapshot: timestamp(now),
      scores: payload.choices.map((_) => '0'),
      voters: 0,
      metadata: undefined,
    };
    this._proposals.push(new MockProposalClient(properties, this));

    return Promise.resolve(properties.id);
  }
}

export default MockDAOClient;
