import { createClient as createGnosisSafeClient } from './gnosis-safe';
import { Asset, Transaction } from './gnosis-safe/types';
import { createClient as createSnapshotClient } from './snapshot-io';
import { Proposal, Vote, zDAO } from './snapshot-io/types';
import { createClient as createZNAClient } from './zNA';
import {
  Config,
  CreateProposalDto,
  ExecuteProposalDto,
  Instance,
  VoteProposalDto,
} from './types';
import { ethers } from 'ethers';

export const createInstance = (config: Config): Instance => {
  const naming = createZNAClient(config.zNA, config.chainId);
  const snapshot = createSnapshotClient(config.snapshot, config.chainId);
  const gnosisSafe = createGnosisSafeClient(config.gnosisSafe, config.chainId);

  const instance: Instance = {
    /**
     * Get all the list of zDAO
     */
    getZDAOs: async (): Promise<zDAO[]> => {
      return await naming.getZDAOs();
    },

    /**
     * Get zDAO by zNA
     * @param zNA zNA address to find zDAO
     */
    getZDAOByZNA: async (zNA: string): Promise<zDAO | undefined> => {
      return await naming.getZDAOByZNA(zNA);
    },

    /**
     * Get zDAO assets by zNAs
     * @param zNA zNA address to get zDAO Assets
     */
    getZDAOAssetsByZNA: async (
      zNA: string
    ): Promise<
      | {
          amountInUSD: number;
          assets: Array<Asset>;
        }
      | undefined
    > => {
      const dao = await instance.getZDAOByZNA(zNA);
      if (!dao) {
        return undefined;
      }
      return await gnosisSafe.getZDAOAssetsByZNA(dao);
    },

    /**
     * Get zDAO transactions by zNA
     * @param zNA zNA address to get zDAO assets
     */
    getZDAOTransactionsByZNA: async (
      zNA: string
    ): Promise<Array<Transaction> | undefined> => {
      const dao = await instance.getZDAOByZNA(zNA);
      if (!dao) {
        return undefined;
      }
      return await gnosisSafe.getZDAOTransactionsByZNA(dao);
    },

    /**
     * Get all the proposals added in the zDAO
     * @param zNA zNA address
     */
    getProposalsByZDAOId: async (
      zNA: string,
      skip: number
    ): Promise<Array<Proposal> | undefined> => {
      const dao = await instance.getZDAOByZNA(zNA);
      if (!dao) {
        return undefined;
      }
      return await snapshot.getProposalsByZDAOId(dao, skip);
    },

    /**
     * Get proposal by proposal id
     * @param proposalId proposal id
     */
    getProposalById: async (
      proposalId: string
    ): Promise<Proposal | undefined> => {
      return await snapshot.getProposalById(proposalId);
    },

    /**
     * Get all the votes by proposal id filtering with the function parameter
     * @param proposalId proposal id
     * @param first voting count to fetch
     * @param voter voter address to filter
     * @param skip start index
     */
    getProposalVotes: async (
      proposalId: string,
      { first, voter, skip }: any
    ): Promise<Array<Vote>> => {
      return await snapshot.getProposalVotes(proposalId, {
        first,
        voter,
        skip,
      });
    },

    /**
     * Get the result of proposal from votes
     * @param zNA zNA address
     * @param proposal proposal information
     * @param votes list of votes to calculate result
     */
    getProposalResults: async (
      zNA: string,
      proposal: Proposal,
      votes: Array<Vote>
    ): Promise<
      | {
          resultsByVoteBalance: number;
          sumOfResultsBalance: number;
        }
      | undefined
    > => {
      const dao = await instance.getZDAOByZNA(zNA);
      if (!dao) {
        return undefined;
      }
      return await snapshot.getProposalResults(dao, proposal, votes);
    },

    /**
     * Get voting power of the user in zDAO
     * @param zNA zNA address
     * @param account account address
     * @param proposal proposal information
     * @returns voting power as number
     */
    getVotingPower: async (
      zNA: string,
      account: string,
      proposal: any
    ): Promise<number | undefined> => {
      const dao = await instance.getZDAOByZNA(zNA);
      if (!dao) {
        return undefined;
      }
      return await snapshot.getVotingPower(dao, account, proposal);
    },

    /**
     * Create a proposal in zDAO
     * @param dao zDAO
     * @param payload packaged parameters to create a proposal
     * @returns proposal id if success
     */
    createProposal: async (
      signer: ethers.Wallet,
      dao: zDAO,
      payload: CreateProposalDto
    ): Promise<string | undefined> => {
      return await snapshot.createProposal(signer, dao, payload);
    },

    /**
     * Cast a vote on proposal
     * @param dao zDAO
     * @param payload packaged paramters to cast a vote
     * @returns true if successfully cast a vote
     */
    voteProposal: async (
      signer: ethers.Wallet,
      dao: zDAO,
      payload: VoteProposalDto
    ): Promise<string | undefined> => {
      return await snapshot.voteProposal(signer, dao, payload);
    },

    /**
     * Execute a proposal in zDAO
     * @param dao zDAO
     * @param payload packaged parameters to execute a proposal
     * @returns tx hash
     */
    executeProposal: async (
      signer: ethers.Wallet,
      dao: zDAO,
      payload: ExecuteProposalDto
    ): Promise<string> => {
      return await snapshot.executeProposal(signer, gnosisSafe, dao, payload);
    },
  };
  return instance;
};
