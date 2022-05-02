import { ethers } from 'ethers';
import shortid from 'shortid';

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
import { NotFoundError } from '../types/error';
import { errorMessageForError } from '../utilities/messages';
import { timestamp } from '../utilities/tx';
import AbstractDAOClient from './AbstractDAOClient';
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
    signer: ethers.Wallet,
    param: CreateZDAOParams
  ): Promise<MockDAOClient> {
    const { chainId } = await signer.provider.getNetwork();

    const properties: zDAOProperties = {
      id: shortid.generate(),
      zNAs: [param.zNA],
      title: param.title,
      createdBy: signer.address,
      network: chainId,
      gnosisSafe: param.gnosisSafe,
      token: param.token,
      amount: param.amount,
      isRelativeMajority: param.isRelativeMajority,
      quorumVotes: param.quorumVotes,
      snapshot: timestamp(new Date()),
      destroyed: false,
    };

    return new MockDAOClient(
      properties,
      new GnosisSafeClient(config.gnosisSafe)
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

  createProposal(
    signer: ethers.Wallet,
    params: CreateProposalParams
  ): Promise<Proposal> {
    // todo, should upload proposal information to IPFS
    const ipfs =
      '0x0170171c23281b16a3c58934162488ad6d039df686eca806f21eba0cebd03486';

    const now = new Date();

    const properties: ProposalProperties = {
      id: (this._proposals.length + 1).toString(),
      createdBy: signer.address,
      title: param.title,
      body: param.body,
      ipfs,
      choices: Object.values(VoteChoice),
      start: now,
      end: new Date(now.getTime() + param.duration * 1000),
      state: 'active',
      snapshot: timestamp(now),
      scores: [0, 0],
      voters: 0,
      metadata: undefined,
    };
    this._proposals.push(new MockProposalClient(properties));

    return Promise.resolve(this._proposals[this._proposals.length - 1]);
  }
}

export default MockDAOClient;
