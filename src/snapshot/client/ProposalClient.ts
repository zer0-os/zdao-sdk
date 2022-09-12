import { BigNumber, ethers } from 'ethers';

import {
  AbstractProposalClient,
  GnosisSafeClient,
  IPFSClient,
} from '../../client';
import {
  Choice,
  InvalidError,
  NotImplementedError,
  PaginationParam,
  ProposalProperties,
  ProposalState,
  TokenMetaData,
} from '../../types';
import {
  errorMessageForError,
  getDecimalAmount,
  getSigner,
} from '../../utilities';
import { SnapshotClient } from '../snapshot';
import { SnapshotProposalProperties } from '../snapshot/types';
import {
  CalculateSnapshotProposalParams,
  FinalizeSnapshotProposalParams,
  SnapshotProposal,
  SnapshotVote,
  VoteSnapshotProposalParams,
} from '../types';
import DAOClient from './DAOClient';
import GlobalClient from './GlobalClient';

class ProposalClient extends AbstractProposalClient<SnapshotVote> {
  private readonly zDAO: DAOClient;
  private readonly snapshotClient: SnapshotClient;
  private readonly gnosisSafeClient: GnosisSafeClient;
  private readonly provider: ethers.providers.Provider;
  private readonly options: any;

  private constructor(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties,
    provider: ethers.providers.Provider,
    options: any
  ) {
    super(properties);
    this.zDAO = zDAO;
    this.snapshotClient = snapshotClient;
    this.gnosisSafeClient = gnosisSafeClient;
    this.provider = provider;
    this.options = options;
  }

  static async createInstance(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties,
    provider: ethers.providers.Provider,
    options: any
  ): Promise<SnapshotProposal> {
    const proposal = new ProposalClient(
      zDAO,
      snapshotClient,
      gnosisSafeClient,
      {
        ...properties,
        metadata: await this.getTokenMetadata(
          GlobalClient.ipfsGateway,
          properties.ipfs
        ),
      },
      provider,
      options
    );
    return proposal;
  }

  private static async getTokenMetadata(
    ipfsGateway: string,
    ipfs: string
  ): Promise<TokenMetaData | undefined> {
    if (!ipfs) return undefined;

    const ipfsData = await IPFSClient.getJson(ipfs, ipfsGateway);
    if (!ipfsData.data || !ipfsData.data.message) {
      throw new InvalidError(errorMessageForError('empty-ipfs-data'));
    }
    if (!ipfsData.data.message.metadata) {
      return undefined;
    }

    const metadataJson = JSON.parse(ipfsData.data.message.metadata);
    if (
      !metadataJson.sender ||
      !metadataJson.recipient ||
      !metadataJson.token ||
      !metadataJson.amount
    ) {
      return undefined;
    }

    const sender = metadataJson.sender;
    const recipient = metadataJson.recipient;
    const token = metadataJson.token;
    const decimals = metadataJson.decimals ?? 18;
    const symbol = metadataJson.symbol ?? 'zToken';
    const amount = metadataJson.amount;

    return {
      sender,
      recipient,
      token,
      decimals,
      symbol,
      amount,
    };
  }

  canExecute(): boolean {
    if (this.zDAO.isRelativeMajority || !this.scores) return false;

    const totalScore = this.scores.reduce(
      (prev, current) => prev.add(current),
      BigNumber.from(0)
    );
    const totalScoreAsBN = getDecimalAmount(
      totalScore,
      this.zDAO.votingToken.decimals
    );
    if (totalScoreAsBN.gte(this.zDAO.minimumTotalVotingTokens)) {
      return true;
    }
    return false;
  }

  async listVotes(pagination?: PaginationParam): Promise<SnapshotVote[]> {
    const limit = 30000;
    let from = pagination?.from ?? 0;
    let count = pagination?.count ?? limit;
    let numberOfResults = limit;
    const votes: SnapshotVote[] = [];

    while (numberOfResults === limit) {
      const results = await this.snapshotClient.listVotes({
        spaceId: this.zDAO.ens,
        network: this.zDAO.network.toString(),
        strategies: this.options.strategies,
        proposalId: this.id,
        scores_state: this.options.scores_state,
        snapshot: Number(this.snapshot),
        from,
        count: count >= limit ? limit : count,
        voter: '',
      });
      votes.push(
        ...results.map((vote: any) => ({
          voter: vote.voter,
          choice: vote.choice as Choice,
          votes: vote.power,
        }))
      );
      from += results.length;
      count -= results.length;
      numberOfResults = results.length;
    }
    return votes;
  }

  async getVotingPowerOfUser(account: string): Promise<string> {
    return this.snapshotClient
      .getVotingPower({
        spaceId: this.zDAO.ens,
        network: this.zDAO.network.toString(),
        snapshot: Number(this.snapshot),
        voter: account,
      })
      .then((value) => value.toString());
  }

  async updateScoresAndVotes(): Promise<SnapshotProposal> {
    const mapState = (
      state: ProposalState
    ): 'pending' | 'active' | 'closed' => {
      if (state === ProposalState.PENDING) {
        return 'pending';
      } else if (state === ProposalState.ACTIVE) {
        return 'active';
      }
      return 'closed';
    };

    const snapshotProposal: SnapshotProposalProperties = {
      id: this.properties.id,
      type: 'single-choice',
      author: this.properties.createdBy,
      title: this.properties.title,
      body: this.properties.body,
      ipfs: this.properties.ipfs,
      choices: this.properties.choices,
      created: this.properties.created,
      start: this.properties.start ?? new Date(),
      end: this.properties.end ?? new Date(),
      state: mapState(this.properties.state),
      scores_state: this.options.scores_state,
      network: this.zDAO.network.toString(),
      snapshot: Number(this.properties.snapshot),
      scores: this.properties.scores?.map((score) => Number(score)) ?? [],
      votes: this.properties.voters ?? 0,
    };

    const updated = await this.snapshotClient.updateScoresAndVotes(
      snapshotProposal,
      {
        spaceId: this.zDAO.ens,
        network: this.zDAO.network.toString(),
        strategies: this.options.strategies,
      }
    );
    this.properties.scores = updated.scores.map((score) => score.toString());
    this.properties.voters = updated.votes;
    return this;
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: VoteSnapshotProposalParams
  ): Promise<void> {
    const signer = getSigner(provider, account);
    const accountAddress = account ? account : await signer.getAddress();
    await this.snapshotClient.voteProposal(provider, accountAddress, {
      spaceId: this.zDAO.ens,
      proposalId: this.id,
      choice: payload.choice,
    });
  }

  calculate(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: CalculateSnapshotProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }

  finalize(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string | undefined,
    _3: FinalizeSnapshotProposalParams
  ): Promise<void> {
    throw new NotImplementedError();
  }
}

export default ProposalClient;
