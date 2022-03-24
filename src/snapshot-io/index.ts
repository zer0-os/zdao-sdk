import Client from '@snapshot-labs/snapshot.js';
import { addSeconds } from 'date-fns';
import { ethers } from 'ethers';
import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { cloneDeep } from 'lodash';

import TransferAbi from '../config/constants/abi/transfer.json';
import { SnapshotConfig } from '../types';
import { PROPOSAL_QUERY, PROPOSALS_QUERY, VOTES_QUERY } from './queries';
import { SnapshotProposal, SnapshotVote } from './types';

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

  async getERCBalanceOf(
    spaceId: string,
    network: string,
    snapshot: number,
    token: string,
    decimals: number,
    symbol: string,
    voter: string
  ): Promise<number> {
    const strategies = this.generateStrategies(token, decimals, symbol);

    let scores: any = await Client.utils.getScores(
      spaceId,
      strategies,
      network,
      [voter],
      snapshot
    );
    scores = scores.map((score: any) =>
      Object.values(score).reduce((a, b: any) => a + b, 0)
    );
    return scores.reduce((a: number, b: number) => a + b, 0);
  }

  async createProposal(
    signer: ethers.Wallet,
    spaceId: string,
    title: string,
    body: string | undefined,
    choices: string[],
    duration: number,
    snapshot: number,
    network: string,
    sender: string,
    recipient: string,
    token: string,
    decimals: number,
    symbol: string,
    amount: string
  ): Promise<{
    id: string;
    ipfs: string;
  }> {
    const startDateTime = new Date();
    const response: any = await this._clientEIP712.proposal(
      signer,
      signer.address,
      {
        from: signer.address,
        space: spaceId,
        timestamp: parseInt((new Date().getTime() / 1e3).toFixed()),
        type: 'single-choice',
        title,
        body: body ?? '',
        choices,
        start: Math.floor(startDateTime.getTime() / 1e3),
        end: Math.floor(addSeconds(startDateTime, duration).getTime() / 1e3),
        snapshot,
        network,
        strategies: JSON.stringify(
          this.generateStrategies(token, decimals, symbol)
        ),
        plugins: '{}',
        metadata: JSON.stringify({
          abi: TransferAbi,
          sender,
          recipient,
          token,
          decimals,
          amount,
        }),
      }
    );
    return {
      id: response.id,
      ipfs: response.ipfsHash,
    };
  }

  async voteProposal(
    signer: ethers.Wallet,
    spaceId: string,
    proposalId: string,
    choice: number
  ): Promise<string> {
    const response: any = await this._clientEIP712.vote(
      signer,
      signer.address,
      {
        space: spaceId,
        proposal: proposalId,
        type: 'single-choice', // payload.proposalType,
        choice: choice,
        metadata: JSON.stringify({}),
      }
    );
    return response.id;
  }
}

export default SnapshotClient;
