import { ethers } from 'ethers';

import { Proposal, ProposalId, SDKInstance, Vote, zDAO } from '../../types';
import {
  CalculateSnapshotProposalParams,
  CreateSnapshotProposalParams,
  CreateSnapshotZDAOParams,
  ExecuteSnapshotProposalParams,
  FinalizeSnapshotProposalParams,
  VoteSnapshotProposalParams,
} from './params';
import { zDAOOptions } from './structures';

export interface SnapshotSDKInstance
  extends SDKInstance<SnapshotVote, SnapshotProposal, SnapshotZDAO> {
  /**
   * Override createZDAO function in SDKInstance
   * @param provider
   * @param account
   * @param params
   */
  createZDAO(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreateSnapshotZDAOParams
  ): Promise<void>;

  /**
   * Override createZDAOFromParams in SDKInstance
   * @param provider
   * @param account
   * @param params
   */
  createZDAOFromParams(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    params: CreateSnapshotZDAOParams
  ): Promise<SnapshotZDAO>;
}

export interface SnapshotZDAO
  extends zDAO<SnapshotVote, SnapshotProposal>,
    zDAOOptions {
  /**
   * Override createProposal fucntion in zDAO
   * @param provider
   * @param account
   * @param payload
   */
  createProposal(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    payload: CreateSnapshotProposalParams
  ): Promise<ProposalId>;
}

export interface SnapshotProposal extends Proposal<SnapshotVote> {
  /**
   * Override vote function in Proposal
   * @param provider
   * @param account
   * @param payload
   */
  vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: VoteSnapshotProposalParams
  ): Promise<void>;

  /**
   * Override calculate function in Proposal
   * @param provider
   * @param account
   * @param payload
   */
  calculate(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: CalculateSnapshotProposalParams
  ): Promise<void>;

  /**
   * Override finalize function in Proposal
   * @param provider
   * @param account
   * @param payload
   */
  finalize(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: FinalizeSnapshotProposalParams
  ): Promise<void>;

  /**
   * Override execute function in Proposal
   * @param provider
   * @param account
   * @param payload
   */
  execute(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: ExecuteSnapshotProposalParams
  ): Promise<void>;
}

export type SnapshotVote = Vote;
