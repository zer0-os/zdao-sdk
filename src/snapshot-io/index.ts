import Client from '@snapshot-labs/snapshot.js';
import { addSeconds } from 'date-fns';
import { ethers } from 'ethers';
import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import cloneDeep from 'lodash/cloneDeep';

import TransferAbi from '../config/constants/abi/transfer.json';
import {
  CreateProposalDto,
  SnapshotConfig,
  VoteProposalDto,
  zDAO,
} from '../types';
import { t } from '../utilities/messages';
import { PROPOSAL_QUERY, PROPOSALS_QUERY, VOTES_QUERY } from './queries';
import {
  Proposal,
  ProposalDetail,
  ProposalResult,
  Vote,
  VoteChoice,
} from './types';

const generateStrategies = (
  address: string,
  decimals: number,
  symbol: string
) => {
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
};

// export interface Space {
//   id: string;
//   name: string;
//   avatar: string;
//   network: string;
//   followers: number;
//   score: number;
// }

// export const listSpaces = async (
//   config: SnapshotConfig,
//   chainId: string
// ): Promise<Space[]> => {
//   const exploreObj: any = await fetch(`${config.serviceUri}/api/explore`).then(
//     (res) => res.json()
//   );

//   const spaces2 = Object.entries(exploreObj.spaces).map(([id, space]: any) => {
//     // map manually selected categories for verified spaces that don't have set their categories yet
//     // set to empty array if space.categories is missing
//     space.categories = space.categories?.length ? space.categories : [];
//     space.avatarUri = Client.utils.getUrl(space.avatar, config.ipfsGateway);

//     return [id, { id, ...space }];
//   });

//   const filters = spaces2
//     .map(([id, space]) => {
//       const followers = space.followers ?? 0;
//       const followers1d = space.followers_1d ?? 0;
//       const isVerified = (verified as any)[id] || 0;
//       let score = followers1d + followers / 4;
//       if (isVerified === 1) score = score * 2;
//       return {
//         ...space,
//         followers,
//         score,
//       };
//     })
//     .filter(
//       (space) =>
//         ((chainId === SupportedChainId.ETHEREUM.toString() && !space.private) ||
//           chainId !== SupportedChainId.ETHEREUM.toString()) &&
//         (verified as any)[space.id] !== -1
//     )
//     .filter((space) => space.network === chainId);

//   const list = orderBy(filters, ['followers', 'score'], ['desc', 'desc']);

//   return list.map((item: any) => ({
//     id: item.id,
//     name: item.name,
//     avatar: item.avatarUri,
//     network: item.network,
//     followers: item.followers,
//     score: item.score,
//   }));
// };

export const createClient = (config: SnapshotConfig, dao: zDAO) => {
  const graphQLClient = new GraphQLClient(`${config.serviceUri}/graphql`);

  const clientEIP712 = new Client.Client712(config.serviceUri);

  const graphQLQuery = async (
    query: RequestDocument,
    variables?: Variables,
    path = ''
  ) => {
    const response = await graphQLClient.request(query, variables);

    return cloneDeep(!path ? response : response[path]);
  };

  const listProposals = async (
    from = 0,
    count = 30000
  ): Promise<Proposal[]> => {
    const response = await graphQLQuery(
      PROPOSALS_QUERY,
      {
        spaceId: dao.zNA,
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
      choices: Object.values(VoteChoice), // response.choices,
      created: new Date(response.start * 1000),
      start: new Date(response.start * 1000),
      end: new Date(response.end * 1000),
      status: response.state,
      network: dao.network,
      snapshot: response.snapshot,
    }));
  };

  const getProposalDetail = async (
    proposalId: string
  ): Promise<ProposalDetail> => {
    const response = await graphQLQuery(
      PROPOSAL_QUERY,
      {
        id: proposalId,
      },
      'proposal'
    );

    // eslint-disable-next-line prefer-const
    let metadata = undefined;
    if (response.ipfs) {
      const ipfsData = await Client.utils.ipfsGet(
        config.ipfsGateway,
        response.ipfs
      );
      if (ipfsData.data && ipfsData.data.message) {
        const metadataJson = JSON.parse(ipfsData.data.message.metadata);
        const abi = metadataJson.abi;
        const sender = metadataJson.sender;
        const recipient = metadataJson.recipient;
        const token = metadataJson.token;
        const decimals = metadataJson.decimals ?? 18;
        const symbol = metadataJson.symbol ?? 'zToken';
        const amount = metadataJson.amount;

        metadata = {
          sender,
          recipient,
          token,
          decimals,
          symbol,
          amount,
          abi,
        };
      }
    }

    return {
      id: response.id,
      type: response.type,
      author: response.author,
      title: response.title,
      body: response.body,
      ipfs: response.ipfs,
      choices: Object.values(VoteChoice), // response.choices,
      created: new Date(response.start * 1000),
      start: new Date(response.start * 1000),
      end: new Date(response.end * 1000),
      state: response.state,
      network: response.network,
      snapshot: response.snapshot,
      scores: response.scores,
      metadata: metadata,
    };
  };

  const getProposalVotes = async (
    proposalId: string,
    from = 0,
    count = 30000,
    voter = ''
  ): Promise<Vote[]> => {
    const response = await graphQLQuery(
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
  };

  const getProposalResults = async (
    proposal: ProposalDetail,
    votes: Vote[]
  ): Promise<ProposalResult> => {
    if (!proposal.metadata) {
      throw Error(t('empty-metadata'));
    }
    const strategies = generateStrategies(
      proposal.metadata?.token,
      proposal.metadata?.decimals,
      proposal.metadata.symbol
    );
    const voters = votes.map((vote) => vote.voter);

    /* Get scores */
    if (proposal.state !== 'pending') {
      console.time('getProposal.scores');
      const scores = await Client.utils.getScores(
        dao.zNA,
        strategies,
        proposal.network,
        voters,
        parseInt(proposal.snapshot)
      );
      console.timeEnd('getProposal.scores');

      votes = votes
        .map((vote: any) => {
          vote.scores = strategies.map(
            (strategy: any, i: number) => scores[i][vote.voter] || 0
          );
          vote.balance = vote.scores.reduce((a: any, b: any) => a + b, 0);
          return vote;
        })
        .sort((a, b) => b.balance - a.balance)
        .filter((vote) => vote.balance > 0);
    }

    /* Get results */
    const votingClass = new (Client.utils.voting as any)[proposal.type](
      proposal,
      votes,
      strategies
    );
    const results = {
      resultsByVoteBalance: votingClass.resultsByVoteBalance(),
      resultsByStrategyScore: votingClass.resultsByStrategyScore(),
      sumOfResultsBalance: votingClass.sumOfResultsBalance(),
    };

    return results;
  };

  const getVotingPower = async (
    account: string,
    proposal: ProposalDetail
  ): Promise<number> => {
    if (!proposal.metadata) {
      throw Error(t('empty-metadata'));
    }
    const strategies = generateStrategies(
      proposal.metadata?.token,
      proposal.metadata?.decimals,
      proposal.metadata.symbol
    );

    let scores: any = await Client.utils.getScores(
      dao.zNA,
      strategies,
      proposal.network,
      [account],
      parseInt(proposal.snapshot)
    );
    scores = scores.map((score: any) =>
      Object.values(score).reduce((a, b: any) => a + b, 0)
    );
    return scores.reduce((a: number, b: number) => a + b, 0);
  };

  const createProposal = async (
    signer: ethers.Wallet,
    payload: CreateProposalDto
  ): Promise<string> => {
    const startDateTime = new Date();
    const response: any = await clientEIP712.proposal(signer, signer.address, {
      from: signer.address,
      space: dao.zNA,
      timestamp: parseInt((new Date().getTime() / 1e3).toFixed()),
      type: 'single-choice',
      title: payload.title,
      body: payload.body ?? '',
      choices: Object.values(VoteChoice),
      start: Math.floor(startDateTime.getTime() / 1e3),
      end: Math.floor(
        addSeconds(startDateTime, payload.duration).getTime() / 1e3
      ),
      snapshot: payload.snapshot,
      network: dao.network,
      strategies: JSON.stringify(
        generateStrategies(
          payload.transfer.token,
          payload.transfer.decimals,
          payload.transfer.symbol
        )
      ),
      plugins: '{}',
      metadata: JSON.stringify({
        abi: TransferAbi,
        sender: dao.safeAddress,
        recipient: payload.transfer.recipient,
        token: payload.transfer.token,
        decimals: payload.transfer.decimals,
        amount: payload.transfer.amount,
      }),
    });
    return response.id;
  };

  const voteProposal = async (
    signer: ethers.Wallet,
    payload: VoteProposalDto
  ): Promise<string> => {
    const response: any = await clientEIP712.vote(signer, signer.address, {
      space: dao.zNA,
      proposal: payload.proposal,
      type: 'single-choice', // payload.proposalType,
      choice: payload.choice,
      metadata: JSON.stringify({}),
    });
    return response.id;
  };

  return {
    listProposals,
    getProposalDetail,
    getProposalVotes,
    getProposalResults,
    getVotingPower,
    createProposal,
    voteProposal,
  };
};
