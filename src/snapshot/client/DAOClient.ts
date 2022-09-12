import { BigNumber, ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import { AbstractDAOClient, GnosisSafeClient } from '../../client';
import { ZDAORecord } from '../../client/ZDAORegistry';
import { DEFAULT_PROPOSAL_CHOICES } from '../../config';
import ERC20Abi from '../../config/abi/ERC20.json';
import {
  InvalidError,
  NotFoundError,
  PaginationParam,
  ProposalId,
  ProposalState,
  zDAOProperties,
  zDAOState,
} from '../../types';
import {
  errorMessageForError,
  getDecimalAmount,
  getFullDisplayBalance,
  getSigner,
  getTotalSupply,
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
    snapshotClient: SnapshotClient,
    options: any
  ) {
    super(properties, new GnosisSafeClient(config.gnosisSafe));
    this.config = config;
    this.zDAOOptions = cloneDeep(properties);
    this.snapshotClient = snapshotClient;
    this.options = options;
  }

  get ens() {
    return this.zDAOOptions.ens;
  }

  static async createInstance(
    config: SnapshotConfig,
    zDAORecord: ZDAORecord
  ): Promise<SnapshotZDAO> {
    const zDAOInfo = await GlobalClient.ethereumZDAOChef.getZDAOPropertiesById(
      zDAORecord.id
    );
    if (!zDAOInfo) {
      throw new NotFoundError(errorMessageForError('not-found-zdao'));
    }

    // should be found by ens in snapshot
    const snapshotClient = new SnapshotClient(config.snapshot);
    const space = await snapshotClient.getSpaceDetails(zDAOInfo.ensSpace);
    if (!space) {
      throw new NotFoundError(
        errorMessageForError('not-found-ens-in-snapshot')
      );
    }

    // strategy is used to check if voter holds minimum token amount
    const strategy = space.strategies.find(
      (strategy) =>
        strategy.name.startsWith('erc20') || strategy.name.startsWith('erc721')
    );
    if (!strategy) {
      throw new NotFoundError(
        errorMessageForError('not-found-strategy-in-snapshot')
      );
    }

    const symbol = strategy.params.symbol;
    const decimals = strategy.params.decimals ?? 0;

    const totalSupplyOfVotingToken = await getTotalSupply(
      GlobalClient.etherRpcProvider,
      strategy.params.address
    ).catch(() => {
      throw new InvalidError(errorMessageForError('not-support-total-supply'));
    });
    const minimumTotalVotingTokens = space.quorum
      ? getDecimalAmount(
          BigNumber.from(space.quorum.toString()),
          decimals
        ).toString()
      : '0';
    const votingThreshold =
      totalSupplyOfVotingToken === BigNumber.from(0)
        ? 0
        : BigNumber.from(minimumTotalVotingTokens)
            .mul(10000)
            .div(totalSupplyOfVotingToken)
            .toNumber();

    const properties: zDAOProperties & zDAOOptions = {
      id: zDAORecord.id,
      zNAs: zDAORecord.associatedzNAs,
      name: space.name,
      createdBy: '',
      network: GlobalClient.etherNetwork,
      gnosisSafe: ethers.utils.getAddress(zDAORecord.gnosisSafe),
      votingToken: {
        token: ethers.utils.getAddress(strategy.params.address),
        symbol,
        decimals,
      },
      minimumVotingTokenAmount: space.threshold
        ? getDecimalAmount(
            BigNumber.from(space.threshold.toString()),
            decimals
          ).toString()
        : '0',
      totalSupplyOfVotingToken: totalSupplyOfVotingToken.toString(),
      votingDuration: space.duration ? Number(space.duration) : 0,
      votingDelay: space.delay ?? 0,
      votingThreshold,
      minimumVotingParticipants: 1,
      minimumTotalVotingTokens,
      isRelativeMajority: false,
      state: zDAOState.ACTIVE,
      snapshot: 0,
      destroyed: false,
      ens: space.id,
    };

    const zDAO = new DAOClient(config, properties, snapshotClient, {
      delay: space.delay,
      strategies: space.strategies,
    });
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
            state: this.mapState(proposal.state),
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
