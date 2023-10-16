import { Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import Client from '@snapshot-labs/snapshot.js';
import { Proposal } from '@snapshot-labs/snapshot.js/dist/sign/types';
import fetch from 'cross-fetch';
import { addSeconds } from 'date-fns';
import { GraphQLClient } from 'graphql-request';
import { orderBy } from 'lodash';

import verified from '../config/verified.json';
import { ENS, ProposalId, SnapshotConfig, SupportedChainId } from '../types';
import { timestamp } from '../utilities/date';
import { graphQLQuery } from '../utilities/graphql';
import { errorMessageForError } from '../utilities/messages';
import {
  PROPOSAL_QUERY,
  PROPOSALS_QUERY,
  SPACES_QUERY,
  SPACES_STRATEGIES_QUERY,
  VOTES_QUERY,
} from './queries';
import {
  CreateProposalParams,
  ERC20BalanceOfParams,
  GetProposalParams,
  ListVotesParams,
  SnapshotProposal,
  SnapshotProposalResponse,
  SnapshotSpace,
  SnapshotSpaceDetails,
  SnapshotSpaceOptions,
  SnapshotVote,
  SpaceParams,
  VoteProposalParams,
  VotingPowerParams,
} from './types';

class SnapshotClient {
  private readonly config: SnapshotConfig;
  private readonly clientEIP712;
  private readonly graphQLClient;
  private spaces: SnapshotSpace[] = [];

  constructor(config: SnapshotConfig) {
    this.config = config;

    this.clientEIP712 = new Client.Client712(config.serviceUri);
    this.graphQLClient = new GraphQLClient(`${config.serviceUri}/graphql`);
  }

  ipfsGet(ipfs: string) {
    try {
      return Client.utils.ipfsGet(this.config.ipfsGateway, ipfs);
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message ?? error.error_description,
        })
      );
    }
  }

  private getScores(
    space: string,
    strategies: any[],
    network: SupportedChainId,
    addresses: string[],
    snapshot?: number | string,
    scoreApiUrl?: string
  ): Promise<any> {
    try {
      return Client.utils.getScores(
        space,
        strategies,
        network.toString(),
        addresses,
        snapshot,
        scoreApiUrl
      );
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message ?? error.error_description,
        })
      );
    }
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

  async listSpaces(network: SupportedChainId): Promise<SnapshotSpace[]> {
    if (this.spaces.length > 0) {
      return this.spaces;
    }

    let exploreObj: any;
    try {
      exploreObj = await fetch(`${this.config.serviceUri}/api/explore`).then(
        (res) => res.json()
      );
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message ?? error.error_description,
        })
      );
    }
    const spaces2 = Object.entries(exploreObj.spaces).map(
      ([id, space]: any) => {
        // map manually selected categories for verified spaces that don't have set their categories yet
        // set to empty array if space.categories is missing
        space.categories = space.categories?.length ? space.categories : [];
        space.avatarUri = Client.utils.getUrl(
          space.avatar,
          this.config.ipfsGateway
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
          ((network === SupportedChainId.MAINNET && !space.private) ||
            network !== SupportedChainId.MAINNET) &&
          (verified as any)[space.id] !== -1
      )
      .filter((space) => space.network === network.toString());
    const list = orderBy(filters, ['followers', 'score'], ['desc', 'desc']);
    this.spaces = list.map(
      (item: any): SnapshotSpace => ({
        id: item.id,
        name: item.name,
        avatar: item.avatarUri,
        network: Number(item.network) as SupportedChainId,
        proposals: item.proposals ? Number(item.proposals) : 0,
        followers: item.followers,
      })
    );
    return this.spaces;
  }

  async getSpaceDetails(spaceId: ENS): Promise<SnapshotSpaceDetails> {
    const response = await graphQLQuery(
      this.graphQLClient,
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
      avatar: Client.utils.getUrl(item.avatar, this.config.ipfsGateway),
      network: Number(item.network) as SupportedChainId,
      proposals: item.proposalsCount ? Number(item.proposalsCount) : 0,
      followers: item.followersCount,
      admins: item.admins,
      strategies: item.strategies,
      threshold: item.filters.minScore,
      duration: item.voting.period,
      delay: item.voting.delay,
      quorum: item.voting.quorum,
    } as SnapshotSpaceDetails;
  }

  async getSpaceOptions(spaceId: ENS): Promise<SnapshotSpaceOptions> {
    const response = await graphQLQuery(
      this.graphQLClient,
      SPACES_STRATEGIES_QUERY,
      {
        id_in: [spaceId],
      },
      'spaces'
    );
    const filter = response.filter((item: any) => item.id === spaceId);
    if (filter.length < 1) {
      throw Error(errorMessageForError('not-found-ens-in-snapshot'));
    }

    return {
      strategies: filter[0].strategies,
      threshold: filter[0].filters.minScore,
      duration: filter[0].voting.period,
      delay: filter[0].voting.delay,
      quorum: filter[0].voting.quorum,
    };
  }

  // this function can not contain immediate voting scores and voters,
  // we should call updateScore per every proposal to update scores and voters
  async listProposals(
    spaceId: ENS,
    network: SupportedChainId,
    from = 0,
    count = 1000
  ): Promise<SnapshotProposal[]> {
    const response = await graphQLQuery(
      this.graphQLClient,
      PROPOSALS_QUERY,
      {
        spaceId,
        network: network.toString(),
        skip: from,
        first: count,
      },
      'proposals'
    );
    return response.map(
      (response: any): SnapshotProposal => ({
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
        scores_state: response.scores_state,
        network: Number(response.network) as SupportedChainId,
        snapshot: Number(response.snapshot),
        scores: response.scores,
        votes: response.votes,
      })
    );
  }

  async updateScoresAndVotes(
    proposal: SnapshotProposal,
    params: SpaceParams
  ): Promise<SnapshotProposal> {
    let proposalScores = proposal.scores;
    let numberOfVoters = proposal.votes;
    if (
      proposal.scores_state !== 'invalid' &&
      proposal.scores_state !== 'final'
    ) {
      // latest scores are still pending on calculation
      // it requires to update right now
      const voteResponse = await graphQLQuery(
        this.graphQLClient,
        VOTES_QUERY,
        {
          id: proposal.id,
          orderBy: 'vp',
          orderDirection: 'desc',
          first: 30000,
          voter: '',
          skip: 0,
        },
        'votes'
      );
      const voters = voteResponse.map((vote: any) => vote.voter);

      let strategies = params.strategies;
      if (!params.strategies) {
        const options = await this.getSpaceOptions(params.spaceId);
        strategies = options.strategies;
      }

      // Get scores
      const scores = await this.getScores(
        params.spaceId,
        strategies,
        params.network,
        voters,
        Number(proposal.snapshot)
      );

      const votes = voteResponse.map((vote: any) => {
        vote.scores = strategies.map(
          (strategy: any, i: number) => Number(scores[i][vote.voter]) || 0
        );
        vote.balance = vote.scores.reduce((a: any, b: any) => a + b, 0);
        return {
          voter: vote.voter,
          choice: vote.choice,
          power: vote.balance,
        };
      });

      proposalScores = proposal.choices.map((choice: any, i: number) =>
        votes
          .filter((vote: any) => vote.choice === i + 1)
          .reduce((a: number, b: any) => a + Number(b.power), 0)
      );
      numberOfVoters = votes.length;
    }

    return {
      ...proposal,
      scores: proposalScores,
      votes: numberOfVoters,
    };
  }

  async getProposal(params: GetProposalParams): Promise<SnapshotProposal> {
    const response = await graphQLQuery(
      this.graphQLClient,
      PROPOSAL_QUERY,
      {
        id: params.proposalId,
      },
      'proposal'
    );

    const proposal: SnapshotProposal = {
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
      scores_state: response.scores_state,
      network: Number(response.network) as SupportedChainId,
      snapshot: Number(response.snapshot),
      scores: response.scores,
      votes: response.votes,
      quorum: response.quorum,
    };
    return proposal;

    // There are tricky method to update proposal scores and voters immediately after voting, no need to call `updateScoresAndVotes
    // return this.updateScoresAndVotes(proposal, {
    //   spaceId: params.spaceId,
    //   network: params.network,
    //   strategies: params.strategies,
    // });
  }

  async listVotes(params: ListVotesParams): Promise<SnapshotVote[]> {
    const response = await graphQLQuery(
      this.graphQLClient,
      VOTES_QUERY,
      {
        id: params.proposalId,
        orderBy: 'vp',
        orderDirection: 'desc',
        first: params.count,
        skip: params.from,
        voter: params.voter,
      },
      'votes'
    );

    if (params.scores_state !== 'invalid' && params.scores_state !== 'final') {
      const voters = response.map((vote: any) => vote.voter);

      // Get scores
      const scores = await this.getScores(
        params.spaceId,
        params.strategies,
        params.network,
        voters,
        params.snapshot
      );

      return response.map((vote: any) => {
        vote.scores = params.strategies.map(
          (strategy: any, i: number) => scores[i][vote.voter] || 0
        );
        vote.balance = vote.scores.reduce((a: any, b: any) => a + b, 0);
        return {
          voter: vote.voter,
          choice: vote.choice,
          power: vote.balance,
        };
      });
    }

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

    let scores: any = await this.getScores(
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

  async getVotingPower(params: VotingPowerParams): Promise<number> {
    const { strategies } = await this.getSpaceOptions(params.spaceId);

    let scores: any = await this.getScores(
      params.spaceId,
      strategies,
      params.network,
      [params.voter],
      Number(params.snapshot)
    );
    scores = scores.map((score: any) =>
      Object.values(score).reduce((a, b: any) => a + b, 0)
    );
    return scores.reduce((a: number, b: number) => a + b, 0);
  }

  async createProposal(
    provider: Web3Provider | Wallet,
    account: string,
    params: CreateProposalParams
  ): Promise<SnapshotProposalResponse> {
    const startDateTime = new Date();
    const delay = params.delay ?? 0;

    let response: any;
    try {
      response = await this.clientEIP712.proposal(provider, account, {
        from: account,
        space: params.spaceId,
        timestamp: timestamp(new Date()),
        type: 'single-choice',
        title: params.title,
        body: params.body,
        choices: params.choices,
        start: timestamp(startDateTime) + delay,
        end: timestamp(addSeconds(startDateTime, params.duration)) + delay,
        snapshot: Number(params.snapshot),
        network: params.network,
        strategies:
          JSON.stringify(params.strategies) ??
          JSON.stringify(
            this.generateStrategies(
              params.token.token,
              params.token.decimals,
              params.token.symbol
            )
          ),
        plugins: '{}',
        metadata: params.transfer
          ? JSON.stringify({
              sender: params.transfer.sender,
              recipient: params.transfer.recipient,
              token: params.transfer.token,
              decimals: params.transfer.decimals,
              amount: params.transfer.amount,
            })
          : '{}',
      } as unknown as Proposal);
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message ?? error.error_description,
        })
      );
    }

    if (!response.id || !response.ipfs) {
      throw Error(errorMessageForError('failed-create-proposal'));
    }

    return {
      id: response.id,
      ipfs: response.ipfs,
    };
  }

  async voteProposal(
    provider: Web3Provider | Wallet,
    account: string,
    params: VoteProposalParams
  ): Promise<string> {
    let response: any;
    try {
      response = await this.clientEIP712.vote(provider, account, {
        space: params.spaceId,
        proposal: params.proposalId,
        type: 'single-choice', // payload.proposalType,
        choice: params.choice,
        metadata: JSON.stringify({}),
      });
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message ?? error.error_description,
        })
      );
    }

    await this.forceUpdateScoresAndVotes(params.proposalId);
    return response.id;
  }

  async forceUpdateScoresAndVotes(proposalId: ProposalId) {
    try {
      // There are tricky method to update proposal scores and voters immediately after voting
      const updateScoreApi = `${this.config.serviceUri}/api/scores/${proposalId}`;
      await fetch(updateScoreApi, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message ?? error.error_description,
        })
      );
    }
  }
}

export default SnapshotClient;
