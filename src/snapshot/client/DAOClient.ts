import { BigNumber, ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import { PlatformType } from '../..';
import { AbstractDAOClient, GnosisSafeClient } from '../../client';
import { DEFAULT_PROPOSAL_CHOICES, DEFAULT_ZDAO_DURATION } from '../../config';
import ERC20Abi from '../../config/abi/ERC20.json';
import {
  InvalidError,
  PaginationParam,
  ProposalId,
  ProposalState,
  zDAOProperties,
} from '../../types';
import {
  errorMessageForError,
  generateProposalHash,
  getDecimalAmount,
  getFullDisplayBalance,
  getSigner,
} from '../../utilities';
import { SnapshotClient } from '../snapshot';
import {
  CreateSnapshotProposalParams,
  SnapshotConfig,
  SnapshotProposal,
  SnapshotVote,
  SnapshotZDAO,
  zDAOOptions,
} from '../types';
import GlobalClient from './GlobalClient';
import ProposalClient from './ProposalClient';

class DAOClient
  extends AbstractDAOClient<SnapshotVote, SnapshotProposal>
  implements SnapshotZDAO
{
  private readonly config: SnapshotConfig;
  protected readonly snapshotClient: SnapshotClient;
  protected readonly zDAOOptions: zDAOOptions;
  private readonly options: any;

  private constructor(
    config: SnapshotConfig,
    properties: zDAOProperties & zDAOOptions,
    options: any
  ) {
    super(
      properties,
      new GnosisSafeClient(config.gnosisSafe, config.ipfsGateway)
    );
    this.config = config;
    this.zDAOOptions = cloneDeep(properties);
    this.options = options;

    this.snapshotClient = new SnapshotClient(config.snapshot);
  }

  get ens() {
    return this.zDAOOptions.ens;
  }

  static async createInstance(
    config: SnapshotConfig,
    properties: zDAOProperties & zDAOOptions,
    options: any
  ): Promise<SnapshotZDAO> {
    if (options === undefined) {
      const snapshotClient = new SnapshotClient(config.snapshot);
      const { strategies, threshold, duration, delay, quorum } =
        await snapshotClient.getSpaceOptions(properties.ens);
      options = { strategies, delay };
      properties.votingDuration = duration ?? DEFAULT_ZDAO_DURATION;
      properties.minimumVotingTokenAmount = threshold
        ? getDecimalAmount(
            BigNumber.from(threshold),
            properties.votingToken.decimals
          ).toString()
        : '0';
      properties.minimumTotalVotingTokens = quorum
        ? getDecimalAmount(
            BigNumber.from(quorum),
            properties.votingToken.decimals
          ).toString()
        : '0';
      properties.votingThreshold =
        properties.totalSupplyOfVotingToken === '0'
          ? 0
          : BigNumber.from(properties.minimumTotalVotingTokens)
              .mul(10000)
              .div(properties.totalSupplyOfVotingToken)
              .toNumber();
    }

    const zDAO = new DAOClient(config, properties, options);
    return zDAO;
  }

  private mapState(
    scores: number[],
    state: string,
    executed: boolean
  ): ProposalState {
    if (state === 'pending') {
      return ProposalState.PENDING;
    } else if (state === 'active') {
      return ProposalState.ACTIVE;
    }
    return executed
      ? ProposalState.EXECUTED
      : this.canExecute(scores)
      ? ProposalState.AWAITING_EXECUTION
      : ProposalState.CLOSED;
  }

  private canExecute(scores: number[]): boolean {
    if (this.isRelativeMajority) return false;

    const totalScore = scores.reduce((prev, current) => prev + current, 0);
    const totalScoreAsBN = getDecimalAmount(
      BigNumber.from(totalScore),
      this.votingToken.decimals
    );
    if (totalScoreAsBN.gte(this.minimumTotalVotingTokens)) {
      return true;
    }
    return false;
  }

  async listProposals(
    pagination?: PaginationParam
  ): Promise<SnapshotProposal[]> {
    const limit = 3000;
    let from = pagination?.from ?? 0;
    let count = pagination?.count ?? limit;
    let numberOfResults = limit;
    const snapshotProposals = [];

    // get the list of proposals
    while (numberOfResults === limit) {
      const results = await this.snapshotClient.listProposals(
        this.ens,
        this.network.toString(),
        from,
        count >= limit ? limit : count
      );

      snapshotProposals.push(...results);

      from += results.length;
      count -= results.length;
      numberOfResults = results.length;
    }

    const executeds = await this.gnosisSafeClient.isProposalsExecuted(
      PlatformType.Snapshot,
      snapshotProposals.map((proposal) =>
        generateProposalHash(PlatformType.Snapshot, this.ens, proposal.id)
      )
    );

    // create all instances
    const promises: Promise<SnapshotProposal>[] = snapshotProposals.map(
      (proposal, index): Promise<SnapshotProposal> =>
        ProposalClient.createInstance(
          this,
          this.snapshotClient,
          this.gnosisSafeClient,
          {
            id: proposal.id,
            createdBy: proposal.author,
            title: proposal.title,
            body: proposal.body ?? '',
            ipfs: proposal.ipfs,
            choices: proposal.choices,
            created: proposal.created,
            start: proposal.start,
            end: proposal.end,
            state: this.mapState(
              proposal.scores,
              proposal.state,
              executeds[index]
            ),
            snapshot: Number(proposal.snapshot),
            scores: proposal.scores.map((score) => score.toString()),
            voters: proposal.votes,
          },
          this.config.ethereumProvider,
          {
            strategies: this.options.strategies,
            scores_state: proposal.scores_state,
          }
        )
    );

    return await Promise.all(promises);
  }

  async getProposal(id: ProposalId): Promise<SnapshotProposal> {
    await this.snapshotClient.forceUpdateScoresAndVotes(id);

    const proposal = await this.snapshotClient.getProposal({
      spaceId: this.ens,
      network: this.network.toString(),
      strategies: this.options.strategies,
      proposalId: id,
    });

    const executed = await this.gnosisSafeClient.isProposalsExecuted(
      PlatformType.Snapshot,
      [generateProposalHash(PlatformType.Snapshot, this.ens, proposal.id)]
    );

    return await ProposalClient.createInstance(
      this,
      this.snapshotClient,
      this.gnosisSafeClient,
      {
        id: proposal.id,
        createdBy: proposal.author,
        title: proposal.title,
        body: proposal.body ?? '',
        ipfs: proposal.ipfs,
        choices: proposal.choices,
        created: proposal.created,
        start: proposal.start,
        end: proposal.end,
        state: this.mapState(proposal.scores, proposal.state, executed[0]),
        snapshot: Number(proposal.snapshot),
        scores: proposal.scores.map((score) => score.toString()),
        voters: proposal.votes,
      },
      this.config.ethereumProvider,
      {
        strategies: this.options.strategies,
        scores_state: proposal.scores_state,
      }
    );
  }

  async createProposal(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: CreateSnapshotProposalParams
  ): Promise<ProposalId> {
    const duration =
      this.votingDuration > 0 ? this.votingDuration : payload.duration ?? 0;
    if (!duration) {
      throw new InvalidError(errorMessageForError('invalid-proposal-duration'));
    }

    const snapshot = await GlobalClient.etherRpcProvider.getBlockNumber();

    const signer = getSigner(provider, account);
    const accountAddress = account ? account : await signer.getAddress();

    // signer should have valid amount of voting token on Ethereum
    const contract = new ethers.Contract(
      this.votingToken.token,
      ERC20Abi,
      provider
    );

    const balance = await contract.balanceOf(account);
    if (balance.lt(this.minimumVotingTokenAmount)) {
      throw new Error(
        errorMessageForError('should-hold-token', {
          amount: getFullDisplayBalance(
            BigNumber.from(this.minimumVotingTokenAmount),
            this.votingToken.decimals
          ),
        })
      );
    }

    const { id: proposalId } = await this.snapshotClient.createProposal(
      provider,
      accountAddress,
      {
        spaceId: this.ens,
        title: payload.title,
        body: payload.body ?? '',
        choices: payload.choices ?? DEFAULT_PROPOSAL_CHOICES,
        delay: this.options.delay,
        duration,
        snapshot,
        network: this.network.toString(),
        strategies: this.options.strategies,
        token: this.votingToken,
        transfer: payload.transfer && {
          sender: this.gnosisSafe,
          recipient: payload.transfer.recipient,
          token: payload.transfer.token,
          decimals: payload.transfer.decimals,
          symbol: payload.transfer.symbol,
          amount: payload.transfer.amount,
        },
      }
    );

    return proposalId;
  }
}

export default DAOClient;
