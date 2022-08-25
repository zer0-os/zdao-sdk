import { ethers } from 'ethers';
import { cloneDeep } from 'lodash';
import shortid from 'shortid';

import { AbstractDAOClient, GnosisSafeClient } from '../../client';
import { DEFAULT_PROPOSAL_CHOICES } from '../../config';
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
  protected readonly zDAOOptions: zDAOOptions;
  private proposals: MockProposalClient[] = [];

  private constructor(
    properties: zDAOProperties & zDAOOptions,
    gnosisSafeClient: GnosisSafeClient
  ) {
    super(properties, gnosisSafeClient);
    this.zDAOOptions = cloneDeep(properties);
  }

  get ens() {
    return this.zDAOOptions.ens;
  }

  static async createInstance(
    config: SnapshotConfig,
    signer: ethers.Signer,
    params: CreateSnapshotZDAOParams
  ): Promise<SnapshotZDAO> {
    const results = await Promise.all([
      getToken(GlobalClient.etherRpcProvider, params.votingToken),
      getTotalSupply(GlobalClient.etherRpcProvider, params.votingToken),
    ]);
    const snapshot = await GlobalClient.etherRpcProvider.getBlockNumber();

    const properties: zDAOProperties & zDAOOptions = {
      id: shortid.generate(),
      zNAs: [params.zNA],
      name: params.name,
      createdBy: '',
      network: params.network,
      gnosisSafe: ethers.utils.getAddress(params.gnosisSafe),
      votingToken: results[0],
      minimumVotingTokenAmount: '0',
      totalSupplyOfVotingToken: results[1].toString(),
      votingDuration: params.votingDuration,
      votingDelay: params.votingDelay ?? 0,
      votingThreshold: 5001,
      minimumVotingParticipants: 1,
      minimumTotalVotingTokens: '0',
      isRelativeMajority: false,
      state: zDAOState.ACTIVE,
      snapshot,
      destroyed: false,
      ens: params.ens,
    };

    return new MockDAOClient(
      properties,
      new GnosisSafeClient(config.gnosisSafe)
    );
  }

  listProposals(): Promise<SnapshotProposal[]> {
    return Promise.resolve(this.proposals);
  }

  getProposal(proposalId: ProposalId): Promise<SnapshotProposal> {
    const found = this.proposals.find((proposal) => proposal.id === proposalId);
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
      id: (this.proposals.length + 1).toString(),
      createdBy: address,
      title: payload.title,
      body: payload.body,
      ipfs,
      choices: payload.choices ?? DEFAULT_PROPOSAL_CHOICES,
      created: now,
      start: now,
      end: new Date(now.getTime() + this.votingDuration * 1000),
      state: ProposalState.ACTIVE,
      snapshot: timestamp(now),
      scores: (payload.choices ?? DEFAULT_PROPOSAL_CHOICES).map((_) => '0'),
      voters: 0,
      metadata: undefined,
    };
    this.proposals.push(new MockProposalClient(properties, this));

    return Promise.resolve(properties.id);
  }
}

export default MockDAOClient;
