import Client from '@snapshot-labs/snapshot.js';
import fetch from 'cross-fetch';
import { addSeconds } from 'date-fns';
import { ethers } from 'ethers';
import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { cloneDeep, orderBy } from 'lodash';

import verified from '../config/constants/verified.json';
import { ENS, SnapshotConfig, SupportedChainId } from '../types';
import { timestamp } from '../utilities/date';
import { errorMessageForError } from '../utilities/messages';
import {
  PROPOSAL_QUERY,
  PROPOSALS_QUERY,
  SPACES_QUERY,
  VOTES_QUERY,
} from './queries';
import {
  CreateProposalParams,
  ERC20BalanceOfParams,
  SnapshotProposal,
  SnapshotProposalResponse,
  SnapshotSpace,
  SnapshotSpaceDetails,
  SnapshotVote,
  VoteProposalParams,
} from './types';

class SnapshotClient {
  private readonly _config: SnapshotConfig;
  private readonly _clientEIP712;
  private readonly _graphQLClient;
  private _spaces: SnapshotSpace[] = [];

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
        name: 'erc20-with-balance',
        params: {
          address,
          decimals,
          symbol,
        },
      },
    ];
  }

  async listSpaces(network: string): Promise<SnapshotSpace[]> {
    if (this._spaces.length > 0) {
      return this._spaces;
    }
    const exploreObj: any = await fetch(
      `${this._config.serviceUri}/api/explore`
    ).then((res) => res.json());
    const spaces2 = Object.entries(exploreObj.spaces).map(
      ([id, space]: any) => {
        // map manually selected categories for verified spaces that don't have set their categories yet
        // set to empty array if space.categories is missing
        space.categories = space.categories?.length ? space.categories : [];
        space.avatarUri = Client.utils.getUrl(
          space.avatar,
          this._config.ipfsGateway
        );
        return [id, { id, ...space }];
      }
    );
    const filters = spaces2
      .map(([id, space]) => {
        const followers = space.followers ?? 0;
        const followers1d = space.followers_1d ?? 0;
        const isVerified = (verified as any)[id] || 0;
        let score = followers1d + followers / 4;
        if (isVerified === 1) score = score * 2;
        return {
          ...space,
          followers,
          score,
        };
      })
      .filter(
        (space) =>
          ((network === SupportedChainId.MAINNET.toString() &&
            !space.private) ||
            network !== SupportedChainId.MAINNET.toString()) &&
          (verified as any)[space.id] !== -1
      )
      .filter((space) => space.network === network);
    const list = orderBy(filters, ['followers', 'score'], ['desc', 'desc']);
    this._spaces = list.map((item: any) => ({
      id: item.id,
      name: item.name,
      avatar: item.avatarUri,
      network: item.network,
      admins: item.admins,
      period: item.voting.period ? item.voting.period : undefined,
      strategies: item.strategies,
      followers: item.followers,
    }));
    return this._spaces;
  }

  async getSpaceDetails(spaceId: ENS): Promise<SnapshotSpaceDetails> {
    const response = await this.graphQLQuery(
      SPACES_QUERY,
      {
        id_in: [spaceId],
      },
      'spaces'
    );
    if (response.length < 1) {
      throw Error(errorMessageForError('not-found-ens-in-snapshot'));
    }
    const item = response[0];
    return {
      id: item.id,
      name: item.name,
      avatar: Client.utils.getUrl(item.avatar, this._config.ipfsGateway),
      network: item.network,
      duration: item.voting.period,
      admins: item.admins,
      strategies: item.strategies,
      followers: item.followersCount,
    };
  }

  async listProposals(
    spaceId: ENS,
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
    provider: ethers.providers.Web3Provider,
    account: string,
    params: VoteProposalParams
  ): Promise<string> {
    const response: any = await this._clientEIP712.vote(provider, account, {
      space: params.spaceId,
      proposal: params.proposalId,
      type: 'single-choice', // payload.proposalType,
      choice: params.choice,
      metadata: JSON.stringify({}),
    });
    return response.id;
  }
}

export default SnapshotClient;
