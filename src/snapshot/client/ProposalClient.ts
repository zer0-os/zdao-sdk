import { ethers } from 'ethers';

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
  ZDAOError,
} from '../../types';
import { errorMessageForError, getSigner } from '../../utilities';
import { SnapshotClient } from '../snapshot';
import { SnapshotProposalProperties } from '../snapshot/types';
import {
  CalculateSnapshotProposalParams,
  ExecuteSnapshotProposalParams,
  FinalizeSnapshotProposalParams,
  SnapshotProposal,
  SnapshotVote,
  VoteSnapshotProposalParams,
} from '../types';
import DAOClient from './DAOClient';
import GlobalClient from './GlobalClient';

class ProposalClient extends AbstractProposalClient<SnapshotVote> {
  private readonly _zDAO: DAOClient;
  private readonly _snapshotClient: SnapshotClient;
  private readonly _gnosisSafeClient: GnosisSafeClient;
  private readonly _options: any;

  private constructor(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties,
    options: any
  ) {
    super(properties);
    this._zDAO = zDAO;
    this._snapshotClient = snapshotClient;
    this._gnosisSafeClient = gnosisSafeClient;
    this._options = options;
  }

  static async createInstance(
    zDAO: DAOClient,
    snapshotClient: SnapshotClient,
    gnosisSafeClient: GnosisSafeClient,
    properties: ProposalProperties,
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
      options
    );
    return proposal;
  }

  private static async getTokenMetadata(
    ipfsGateway: string,
    ipfs: string
  ): Promise<TokenMetaData | undefined> {
    try {
      if (!ipfs) return undefined;

      const ipfsData = await IPFSClient.getJson(ipfs, ipfsGateway);
      if (!ipfsData.data || !ipfsData.data.message) {
        throw new InvalidError(errorMessageForError('empty-voting-token'));
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
    } catch (error) {
      return undefined;
    }
  }

  async listVotes(pagination?: PaginationParam): Promise<SnapshotVote[]> {
    const limit = 30000;
    let from = pagination?.from ?? 0;
    let count = pagination?.count ?? limit;
    let numberOfResults = limit;
    const votes: SnapshotVote[] = [];

    while (numberOfResults === limit) {
      const results = await this._snapshotClient.listVotes({
        spaceId: this._zDAO.ens,
        network: this._zDAO.network.toString(),
        strategies: this._options.strategies,
        proposalId: this.id,
        scores_state: this._options.scores_state,
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
    return this._snapshotClient
      .getVotingPower({
        spaceId: this._zDAO.ens,
        network: this._zDAO.network.toString(),
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
      id: this._properties.id,
      type: 'single-choice',
      author: this._properties.createdBy,
      title: this._properties.title,
      body: this._properties.body,
      ipfs: this._properties.ipfs,
      choices: this._properties.choices,
      created: this._properties.created,
      start: this._properties.start ?? new Date(),
      end: this._properties.end ?? new Date(),
      state: mapState(this._properties.state),
      scores_state: this._options.scores_state,
      network: this._zDAO.network.toString(),
      snapshot: Number(this._properties.snapshot),
      scores: this._properties.scores?.map((score) => Number(score)) ?? [],
      votes: this._properties.voters ?? 0,
    };

    const updated = await this._snapshotClient.updateScoresAndVotes(
      snapshotProposal,
      {
        spaceId: this._zDAO.ens,
        network: this._zDAO.network.toString(),
        strategies: this._options.strategies,
      }
    );
    this._properties.scores = updated.scores.map((score) => score.toString());
    this._properties.voters = updated.votes;
    return this;
  }

  async vote(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: VoteSnapshotProposalParams
  ): Promise<void> {
    const signer = getSigner(provider, account);
    const accountAddress = account ? account : await signer.getAddress();
    await this._snapshotClient.voteProposal(provider, accountAddress, {
      spaceId: this._zDAO.ens,
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

  async execute(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    _: ExecuteSnapshotProposalParams
  ): Promise<void> {
    if (!this.metadata) return;

    const signer = getSigner(provider, account);

    const address = account ?? (await signer.getAddress());
    const isOwner = await this._gnosisSafeClient.isOwnerAddress(
      signer,
      this._zDAO.ens,
      address
    );
    if (!isOwner) {
      throw new ZDAOError(errorMessageForError('not-gnosis-owner'));
    }

    if (!this.metadata) {
      throw new ZDAOError(errorMessageForError('empty-metadata'));
    }
    if (this.state !== ProposalState.AWAITING_EXECUTION) {
      throw new ZDAOError(errorMessageForError('not-executable-proposal'));
    }

    if (!this.metadata?.token || this.metadata.token.length < 1) {
      // Ether transfer
      await this._gnosisSafeClient.transferEther(
        this._zDAO.gnosisSafe,
        signer,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.metadata!.recipient,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.metadata!.amount.toString()
      );
    } else {
      // ERC20 transfer
      await this._gnosisSafeClient.transferERC20(
        this._zDAO.gnosisSafe,
        signer,
        this.metadata.token,
        this.metadata.recipient,
        this.metadata.amount.toString()
      );
    }
  }
}

export default ProposalClient;
