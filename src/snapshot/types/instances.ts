import {
  Proposal as BaseProposal,
  SDKInstance as SDKBaseInstance,
  Vote as BaseVote,
  zDAO as BaseZDAO,
} from '../../types';
import { zDAOOptions } from './structures';

export type SDKInstance = SDKBaseInstance<Vote, Proposal, zDAO>;

export interface zDAO extends BaseZDAO<Vote, Proposal>, zDAOOptions {}

export type Proposal = BaseProposal<Vote>;

export type Vote = BaseVote;
