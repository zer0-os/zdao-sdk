import Client from '@snapshot-labs/snapshot.js';
import { addSeconds } from 'date-fns';
import { ethers } from 'ethers';
import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { cloneDeep } from 'lodash';

import { SnapshotConfig } from '../types';
import { timestamp } from '../utilities/date';
import { errorMessageForError } from '../utilities/messages';
import { PROPOSAL_QUERY, PROPOSALS_QUERY, VOTES_QUERY } from './queries';
import {
  CreateProposalParams,
  ERC20BalanceOfParams,
  SnapshotProposal,
  SnapshotProposalResponse,
  SnapshotVote,
  VoteProposalParams,
} from './types';

class SnapshotClient {
  private readonly _config: SnapshotConfig;
  private readonly _clientEIP712;
  private readonly _graphQLClient;

  constructor(config: SnapshotConfig) {
    this._config = config;

    this._clientEIP712 = new Client.Client712(config.serviceUri);
    this._graphQLClient = new GraphQLClient(`${config.serviceUri}/graphql`);
  }

  private async graphQLQuery(
    query: RequestDocument,
    variables?: Variables,
    path = ''
  ) {
    const response = await this._graphQLClient.request(query, variables);

    return cloneDeep(!path ? response : response[path]);
  }

  ipfsGet(ipfs: string) {
    return Client.utils.ipfsGet(this._config.ipfsGateway, ipfs);
  }

  private generateStrategies(
    address: string,
    decimals: number,
    symbol: string
  ): any[] {
    return [
      {
        name: 'erc20-balance-of',
        params: {
          address,
          decimals,
          symbol,
        },
      },
    ];
  }

  async listProposals(
    spaceId: string,
    network: string,
    from = 0,
    count = 30000
  ): Promise<SnapshotProposal[]> {
    const response = await this.graphQLQuery(
      PROPOSALS_QUERY,
      {
        spaceId,
        network,
        skip: from,
        first: count,
      },
      'proposals'
    );
    return response.map((response: any) => ({
      id: response.id,
      type: response.type,
      author: response.author,
      title: response.title,
      body: response.body,
      ipfs: response.ipfs,
      choices: response.choices,
      created: new Date(response.created * 1000),
      start: new Date(response.start * 1000),
      end: new Date(response.end * 1000),
      state: response.state,
      network: response.network,
      snapshot: response.snapshot,
      scores: response.scores,
      votes: response.votes,
    }));
  }

  async getProposal(proposalId: string): Promise<SnapshotProposal> {
    const response = await this.graphQLQuery(
      PROPOSAL_QUERY,
      {
        id: proposalId,
      },
      'proposal'
    );

    return {
      id: response.id,
      type: response.type,
      author: response.author,
      title: response.title,
      body: response.body,
      ipfs: response.ipfs,
      choices: response.choices,
      created: new Date(response.start * 1000),
      start: new Date(response.start * 1000),
      end: new Date(response.end * 1000),
      state: response.state,
      network: response.network,
      snapshot: response.snapshot,
      scores: response.scores,
      votes: response.votes,
    };
  }

  async listVotes(
    proposalId: string,
    from = 0,
    count = 30000,
    voter = ''
  ): Promise<SnapshotVote[]> {
    const response = await this.graphQLQuery(
      VOTES_QUERY,
      {
        id: proposalId,
        orderBy: 'vp',
        orderDirection: 'desc',
        first: count,
        voter,
        skip: from,
      },
      'votes'
    );

    return response.map((vote: any) => ({
      voter: vote.voter,
      choice: vote.choice,
      power: vote.vp,
    }));
  }

  async getERC20BalanceOf(params: ERC20BalanceOfParams): Promise<number> {
    const strategies = this.generateStrategies(
      params.token,
      params.decimals,
      params.symbol
    );

    let scores: any = await Client.utils.getScores(
      params.spaceId,
      strategies,
      params.network,
      [params.voter],
      params.snapshot
    );
    scores = scores.map((score: any) =>
      Object.values(score).reduce((a, b: any) => a + b, 0)
    );
    return scores.reduce((a: number, b: number) => a + b, 0);
  }

  async createProposal(
    signer: ethers.Wallet,
    params: CreateProposalParams
  ): Promise<SnapshotProposalResponse> {
    const startDateTime = new Date();
    const response: any = await this._clientEIP712.proposal(
      signer,
      signer.address,
      {
        from: signer.address,
        space: params.spaceId,
        timestamp: timestamp(new Date()),
        type: 'single-choice',
        title: params.title,
        body: params.body,
        choices: params.choices,
        start: timestamp(startDateTime),
        end: timestamp(addSeconds(startDateTime, params.duration)),
        snapshot: params.snapshot,
        network: params.network,
        strategies: JSON.stringify(
          this.generateStrategies(params.token, params.decimals, params.symbol)
        ),
        plugins: '{}',
        metadata: JSON.stringify({
          abi: params.abi,
          sender: params.sender,
          recipient: params.recipient,
          token: params.token,
          decimals: params.decimals,
          amount: params.amount,
        }),
      }
    );

    if (!response.id || !response.ipfs) {
      throw Error(errorMessageForError('failed-create-proposal'));
    }

    return {
      id: response.id,
      ipfs: response.ipfs,
    };
  }

  async voteProposal(
    signer: ethers.Wallet,
    params: VoteProposalParams
  ): Promise<string> {
    const response: any = await this._clientEIP712.vote(
      signer,
      signer.address,
      {
        space: params.spaceId,
        proposal: params.proposalId,
        type: 'single-choice', // payload.proposalType,
        choice: params.choice,
        metadata: JSON.stringify({}),
      }
    );
    return response.id;
  }
}

export default SnapshotClient;
