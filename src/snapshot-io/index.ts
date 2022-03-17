import { QueryOptions } from '@apollo/client';
import Client from '@snapshot-labs/snapshot.js';
import { addSeconds } from 'date-fns';
import { ethers } from 'ethers';
import cloneDeep from 'lodash/cloneDeep';
import { createApolloClient } from '../helpers/apollo';
import TransferAbi from '../config/constants/abi/transfer.json';
import {
  CreateProposalDto,
  ExecuteProposalDto,
  SnapshotConfig,
  VoteProposalDto,
} from '../types';
import { PROPOSALS_QUERY, PROPOSAL_QUERY, VOTES_QUERY } from './queries';
import { Proposal, Vote, VoteChoice, zDAO } from './types';
import { SafeEthersSigner, SafeService } from '@gnosis.pm/safe-ethers-adapters';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import Safe from '@gnosis.pm/safe-core-sdk';

export const createClient = (config: SnapshotConfig, chainId: string) => {
  const apolloClient = createApolloClient(`${config.serviceUri}/graphql`);

  const clientEIP712 = new Client.Client712(config.serviceUri);

  const apolloQuery = async (options: QueryOptions, path = '') => {
    const response = await apolloClient.query(options);

    return cloneDeep(!path ? response.data : response.data[path]);
  };

  const extendToDecimals = (decimals: number): ethers.BigNumber => {
    return ethers.BigNumber.from(10).pow(decimals);
  };

  /**
   * Get all the proposals added in the zDAO
   * @param zNA zNA address
   */
  const getProposalsByZDAOId = async (
    dao: zDAO,
    skip: number
  ): Promise<Array<Proposal>> => {
    const response = await apolloQuery(
      {
        query: PROPOSALS_QUERY,
        variables: {
          spaceId: dao.zNA,
          skip,
        },
      },
      'proposals'
    );
    return response.map((response: any) => ({
      id: response.id,
      type: response.type,
      author: response.author,
      title: response.title,
      body: response.body,
      ipfs: response.ipfs ?? undefined,
      choices: response.choices,
      created: new Date(response.start * 1000),
      start: new Date(response.start * 1000),
      end: new Date(response.end * 1000),
      status: response.state,
      network: dao.network,
      snapshot: response.snapshot,
      scores: undefined,
      strategies: response.strategies,
      metadata: undefined,
    }));
  };

  /**
   * Get proposal by proposal id
   * @param proposalId proposal id
   */
  const getProposalById = async (
    proposalId: string
  ): Promise<Proposal | undefined> => {
    const response = await apolloQuery(
      {
        query: PROPOSAL_QUERY,
        variables: {
          id: proposalId,
        },
      },
      'proposal'
    );

    // eslint-disable-next-line prefer-const
    let metadata = undefined;
    if (response.ipfs) {
      const ipfsData = await Client.utils.ipfsGet(
        config.ipfsUri,
        response.ipfs
      );
      if (ipfsData.data && ipfsData.data.message) {
        const metadataJson = JSON.parse(ipfsData.data.message.metadata);
        const abi = metadataJson.abi;
        const sender = metadataJson.sender;
        const recipient = metadataJson.recipient;
        const token = metadataJson.token;
        const amount = metadataJson.amount;

        metadata = {
          sender,
          recipient,
          token,
          amount,
        };
      }
    }

    return {
      id: response.id,
      type: response.type,
      author: response.author,
      title: response.title,
      body: response.body,
      ipfs: response.ipfs ?? undefined,
      choices: response.choices,
      created: new Date(response.start * 1000),
      start: new Date(response.start * 1000),
      end: new Date(response.end * 1000),
      state: response.state,
      network: response.network,
      snapshot: response.snapshot,
      scores: response.scores,
      strategies: response.strategies,
      metadata: metadata,
    };
  };

  /**
   * Get all the votes by proposal id filtering with the function parameter
   * @param proposalId proposal id
   * @param first voting count to fetch
   * @param voter voter address to filter
   * @param skip start index
   */
  const getProposalVotes = async (
    proposalId: string,
    { first, voter, skip }: any
  ): Promise<Array<Vote>> => {
    const response = await apolloQuery(
      {
        query: VOTES_QUERY,
        variables: {
          id: proposalId,
          orderBy: 'vp',
          orderDirection: 'desc',
          first,
          voter,
          skip,
        },
      },
      'votes'
    );

    return response.map((vote: any) => ({
      voter: vote.voter,
      choice: vote.choice,
      power: vote.vp,
    }));
  };

  /**
   * Get the result of proposal from votes
   * @param zNA zNA address
   * @param proposal proposal information
   * @param votes list of votes to calculate result
   */
  const getProposalResults = async (
    dao: zDAO,
    proposal: Proposal,
    votes: Array<Vote>
  ): Promise<{
    resultsByVoteBalance: number;
    sumOfResultsBalance: number;
  }> => {
    const voters = votes.map((vote) => vote.voter);
    const strategies = proposal.strategies ?? dao.strategies;

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

  /**
   * Get voting power of the user in zDAO
   * @param dao zDAO address
   * @param account account address
   * @param proposal proposal information
   * @returns voting power as number
   */
  const getVotingPower = async (
    dao: zDAO,
    account: string,
    proposal: any
  ): Promise<number> => {
    const strategies = proposal.strategies ?? dao.strategies;
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

  /**
   * Create a proposal in zDAO
   * @param dao zDAO
   * @param payload packaged parameters to create a proposal
   * @returns proposal id if success
   */
  const createProposal = async (
    signer: ethers.Wallet,
    dao: zDAO,
    payload: CreateProposalDto
  ): Promise<string | undefined> => {
    const startDateTime = new Date();
    const response: any = await clientEIP712.proposal(signer, payload.from, {
      from: payload.from,
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
      strategies: JSON.stringify(dao.strategies),
      plugins: '{}',
      metadata: JSON.stringify({
        abi: TransferAbi,
        sender: dao.safeAddress,
        recipient: payload.transfer.recipient,
        token: payload.transfer.token,
        decimals: payload.transfer.decimals,
        amount: ethers.BigNumber.from(payload.transfer.amount)
          .mul(extendToDecimals(payload.transfer.decimals))
          .toJSON(),
      }),
    });
    return (response && response.id) ?? undefined;
  };

  /**
   * Cast a vote on proposal
   * @param dao zDAO
   * @param payload packaged paramters to cast a vote
   * @returns true if successfully cast a vote
   */
  const voteProposal = async (
    signer: ethers.Wallet,
    dao: zDAO,
    payload: VoteProposalDto
  ): Promise<string | undefined> => {
    const response: any = await clientEIP712.vote(signer, payload.from, {
      space: dao.zNA,
      proposal: payload.proposal,
      type: payload.proposalType,
      choice: payload.choice,
      metadata: JSON.stringify({}),
    });
    return (response && response.id) ?? undefined;
  };

  /**
   * Execute a proposal in zDAO
   * @param dao zDAO
   * @param payload packaged parameters to execute a proposal
   * @returns tx hash
   */
  const executeProposal = async (
    signer: ethers.Wallet,
    dao: zDAO,
    payload: ExecuteProposalDto
  ): Promise<string | undefined> => {
    // const service = new SafeService(SAFE_SERVICE_URL);
    // const ethAdapter = new EthersAdapter({
    //   ethers,
    //   signer,
    // });
    // const safe = await Safe.create({ ethAdapter, safeAddress: SAFE_ADDRESS });
    // const owners = await safe.getOwners();
    // if (!owners.find((owner) => owner === payload.from)) {
    //   return undefined;
    // }

    // const safeSigner = new SafeEthersSigner(safe, service, config.provider);
    // let proposedTx;
    // if (metaData.token.length > 0) {
    //   // ERC20 tokens
    //   const transferContract = new ethers.Contract(
    //     metaData.token,
    //     metaData.abi,
    //     safeSigner
    //   );
    //   proposedTx = await transferContract
    //     .connect(safeSigner)
    //     .transfer(metaData.recipient, metaData.amount.toString());
    // } else {
    //   proposedTx = await safeSigner.sendTransaction({
    //     to: metaData.recipient,
    //     value: metaData.amount.toString(),
    //   });
    // }

    return '';
  };

  return {
    getProposalsByZDAOId,
    getProposalById,
    getProposalVotes,
    getProposalResults,
    getVotingPower,
    createProposal,
    voteProposal,
    executeProposal,
  };
};
