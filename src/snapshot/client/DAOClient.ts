import { BigNumber, ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import { AbstractDAOClient, GnosisSafeClient } from '../../client';
import { DEFAULT_ZDAO_DURATION } from '../../config';
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
      properties.duration = duration ?? DEFAULT_ZDAO_DURATION;
      properties.amount = threshold
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
    }

    const zDAO = new DAOClient(config, properties, options);
    return zDAO;
  }

  private mapState(state: string): ProposalState {
    if (state === 'pending') {
      return ProposalState.PENDING;
    } else if (state === 'active') {
      return ProposalState.ACTIVE;
    }
    return ProposalState.CLOSED;
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

    // create all instances
    const promises: Promise<SnapshotProposal>[] = snapshotProposals.map(
      (proposal): Promise<SnapshotProposal> =>
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
            state: this.mapState(proposal.state),
            snapshot: Number(proposal.snapshot),
            scores: proposal.scores.map((score) => score.toString()),
            voters: proposal.votes,
          },
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
        state: this.mapState(proposal.state),
        snapshot: Number(proposal.snapshot),
        scores: proposal.scores.map((score) => score.toString()),
        voters: proposal.votes,
      },
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
    const duration = this.duration > 0 ? this.duration : payload.duration ?? 0;
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
    if (balance.lt(this.amount)) {
      throw new Error(
        errorMessageForError('should-hold-token', {
          amount: getFullDisplayBalance(
            BigNumber.from(this.amount),
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
        choices: payload.choices,
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
