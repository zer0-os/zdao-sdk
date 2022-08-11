import { BigNumber, ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import { PlatformType } from '../..';
import { AbstractDAOClient, GnosisSafeClient, IPFSClient } from '../../client';
import { ZDAORecord } from '../../client/ZDAORegistry';
import { DEFAULT_PROPOSAL_CHOICES } from '../../config';
import { IERC20Upgradeable__factory } from '../../config/types/factories/IERC20Upgradeable__factory';
import { IERC20Upgradeable } from '../../config/types/IERC20Upgradeable';
import {
  AlreadyDestroyedError,
  FailedTxError,
  InvalidError,
  NotFoundError,
  NotSyncStateError,
  ProposalId,
  ProposalProperties,
  ProposalState,
  Token,
  zDAOProperties,
  zDAOState,
} from '../../types';
import {
  errorMessageForError,
  getFullDisplayBalance,
  getSigner,
  getToken,
  getTotalSupply,
} from '../../utilities';
import { EthereumZDAO, IEthereumZDAO } from '../config/types/EthereumZDAO';
import { PolygonZDAO as PolygonZDAOContract } from '../config/types/PolygonZDAO';
import {
  CreatePolygonProposalParams,
  PolygonConfig,
  PolygonProposal,
  PolygonVote,
  PolygonZDAO,
  VoteChoice,
  zDAOOptions,
} from '../types';
import GlobalClient from './GlobalClient';
import ProofClient from './ProofClient';
import ProposalClient from './ProposalClient';

class DAOClient
  extends AbstractDAOClient<PolygonVote, PolygonProposal>
  implements PolygonZDAO
{
  protected readonly zDAOOptions: zDAOOptions;
  protected ethereumZDAO!: EthereumZDAO;
  protected polygonZDAO: PolygonZDAOContract | null = null;
  protected rootTokenContract!: IERC20Upgradeable;

  private constructor(
    properties: zDAOProperties & zDAOOptions,
    gnosisSafeClient: GnosisSafeClient
  ) {
    super(properties, gnosisSafeClient);
    this.zDAOOptions = cloneDeep(properties);

    return (async (): Promise<DAOClient> => {
      this.rootTokenContract = IERC20Upgradeable__factory.connect(
        properties.votingToken.token,
        GlobalClient.etherRpcProvider
      );

      const promises: Promise<any>[] = [
        GlobalClient.ethereumZDAOChef.getZDAOById(this.properties.id),
        this.getPolygonZDAOContract(),
      ];
      const results = await Promise.all(promises);

      this.ethereumZDAO = results[0] as EthereumZDAO;
      this.polygonZDAO = results[1] as PolygonZDAOContract;

      if (this.polygonZDAO) {
        this.properties.state = zDAOState.ACTIVE;
      }
      if (properties.destroyed) {
        this.properties.state = zDAOState.CANCELED;
      }
      return this;
    })() as unknown as DAOClient;
  }

  get polygonToken() {
    return this.zDAOOptions.polygonToken;
  }

  static async createInstance(
    config: PolygonConfig,
    zDAORecord: ZDAORecord
  ): Promise<PolygonZDAO> {
    const zDAOInfos = await Promise.all([
      GlobalClient.ethereumZDAOChef.getZDAOInfoById(zDAORecord.id),
      GlobalClient.polygonZDAOChef.getZDAOInfoById(zDAORecord.id),
    ]);

    const tokens = await Promise.all([
      getToken(GlobalClient.etherRpcProvider, zDAOInfos[0].token),
      zDAOInfos[1] &&
        getToken(GlobalClient.polyRpcProvider, zDAOInfos[1].token),
      getTotalSupply(GlobalClient.etherRpcProvider, zDAOInfos[0].token).catch(
        () => {
          throw new InvalidError(
            errorMessageForError('not-support-total-supply')
          );
        }
      ),
    ]);

    const network = await GlobalClient.etherRpcProvider.getNetwork();

    const etherZDAOInfo = zDAOInfos[0];
    const instance = await new DAOClient(
      {
        id: zDAORecord.id,
        zNAs: zDAORecord.associatedzNAs,
        name: zDAORecord.name,
        createdBy: etherZDAOInfo.createdBy,
        network: network.chainId,
        gnosisSafe: etherZDAOInfo.gnosisSafe,
        votingToken: tokens[0] as Token,
        minimumVotingTokenAmount: etherZDAOInfo.amount.toString(),
        totalSupplyOfVotingToken: tokens[2].toString(),
        votingDuration: etherZDAOInfo.duration.toNumber(),
        votingDelay: etherZDAOInfo.votingDelay.toNumber(),
        votingThreshold: etherZDAOInfo.votingThreshold.toNumber(),
        minimumVotingParticipants:
          etherZDAOInfo.minimumVotingParticipants.toNumber(),
        minimumTotalVotingTokens:
          etherZDAOInfo.minimumTotalVotingTokens.toString(),
        isRelativeMajority: etherZDAOInfo.isRelativeMajority,
        state: zDAOState.PENDING,
        snapshot: etherZDAOInfo.snapshot.toNumber(),
        destroyed: etherZDAOInfo.destroyed,
        polygonToken: tokens[1] as Token,
      },
      new GnosisSafeClient(config.gnosisSafe, config.ipfsGateway)
    );
    return instance;
  }

  async getPolygonZDAOContract(): Promise<PolygonZDAOContract | null> {
    if (this.polygonZDAO) return this.polygonZDAO;
    this.polygonZDAO = await GlobalClient.polygonZDAOChef.getZDAOById(
      this.properties.id
    );
    return this.polygonZDAO;
  }

  private async mapToProperties(
    raw: IEthereumZDAO.ProposalStruct,
    executed: boolean
  ): Promise<ProposalProperties> {
    const polygonZDAO = await this.getPolygonZDAOContract();
    const polyProposal = polygonZDAO
      ? await polygonZDAO.getProposalById(raw.proposalId)
      : null;
    const isSyncedProposal = polyProposal
      ? polyProposal.proposalId.eq(raw.proposalId)
      : false;

    const created = new Date(Number(raw.created) * 1000);
    const start =
        polygonZDAO && polyProposal && isSyncedProposal
          ? new Date(Number(polyProposal.startTimestamp) * 1000)
          : undefined,
      end =
        polygonZDAO && polyProposal && isSyncedProposal
          ? new Date(Number(polyProposal.endTimestamp) * 1000)
          : undefined,
      now = new Date();
    const snapshot =
      polygonZDAO && polyProposal && isSyncedProposal
        ? polyProposal.snapshot.toNumber()
        : undefined;
    const scores =
      polygonZDAO && polyProposal && isSyncedProposal
        ? polyProposal.votes
        : undefined;
    const voters =
      polygonZDAO && polyProposal && isSyncedProposal
        ? polyProposal.voters.toNumber()
        : undefined;

    const canExecute = (): boolean => {
      if (!scores || !voters) return false;

      const sumOfScores = scores.reduce(
        (prev, current) => prev.add(current),
        BigNumber.from(0)
      );
      const zero = BigNumber.from(0);
      if (
        voters < this.minimumVotingParticipants ||
        sumOfScores.lt(BigNumber.from(this.minimumTotalVotingTokens)) // <
      ) {
        return false;
      }

      // if relative majority, the denominator should be sum of yes and no votes
      if (
        this.isRelativeMajority &&
        sumOfScores.gt(zero) &&
        scores[0]
          .mul(BigNumber.from(10000))
          .div(sumOfScores)
          .gte(BigNumber.from(this.votingThreshold))
      ) {
        return true;
      }

      const totalSupply = BigNumber.from(this.totalSupplyOfVotingToken);

      // if absolute majority, the denominator should be total supply
      if (
        !this.isRelativeMajority &&
        totalSupply.gt(zero) &&
        scores[0]
          .mul(10000)
          .div(totalSupply)
          .gte(BigNumber.from(this.votingThreshold))
      ) {
        return true;
      }
      return false;
    };

    const mapState = (raw: IEthereumZDAO.ProposalStruct): ProposalState => {
      if (raw.canceled) {
        return ProposalState.CANCELED;
      } else if (
        start === undefined ||
        end === undefined ||
        scores === undefined ||
        voters === undefined
      ) {
        return ProposalState.PENDING;
      } else if (now <= end) {
        return ProposalState.ACTIVE;
      } else if (executed) {
        return ProposalState.EXECUTED;
      } else if (raw.calculated) {
        return canExecute()
          ? ProposalState.AWAITING_EXECUTION
          : ProposalState.CLOSED;
      } else if (polyProposal?.calculated) {
        return ProposalState.AWAITING_FINALIZATION;
      }
      return ProposalState.AWAITING_CALCULATION;
    };

    const ipfsData = await IPFSClient.getJson(
      raw.ipfs.toString(),
      GlobalClient.ipfsGateway
    );
    const metadataJson =
      ipfsData.data.message && ipfsData.data.message.transfer;

    return {
      id: raw.proposalId.toString(),
      createdBy: raw.createdBy,
      title: ipfsData.data.message.title,
      body: ipfsData.data.message.body,
      ipfs: raw.ipfs.toString(),
      choices: [VoteChoice.YES, VoteChoice.NO],
      created,
      start,
      end,
      state: mapState(raw),
      snapshot,
      scores: scores?.map((score) => score.toString()),
      voters,
      metadata: metadataJson && {
        sender: metadataJson.sender,
        recipient: metadataJson.recipient,
        token: metadataJson.token,
        decimals: metadataJson.decimals ?? 18,
        symbol: metadataJson.symbol ?? 'zToken',
        amount: metadataJson.amount,
      },
    };
  }

  async listProposals(): Promise<PolygonProposal[]> {
    const count = 100;
    let from = 0;
    let numberOfResults = count;

    const proposalPromises: Promise<PolygonProposal>[] = [];

    while (numberOfResults === count) {
      const results: IEthereumZDAO.ProposalStructOutput[] =
        await this.ethereumZDAO.listProposals(from, count);

      const executeds = await this.gnosisSafeClient.isProposalsExecuted(
        PlatformType.Polygon,
        results.map((raw) =>
          ProposalClient.getProposalHash(this.id, raw.proposalId.toString())
        )
      );

      const promises: Promise<ProposalProperties>[] = [];
      promises.push(
        ...results.map((proposal, index) =>
          this.mapToProperties(proposal, executeds[index])
        )
      );

      const propertiesAll: ProposalProperties[] = await Promise.all(promises);
      proposalPromises.push(
        ...propertiesAll.map((properties) =>
          ProposalClient.createInstance(this, properties)
        )
      );

      from += results.length;
      numberOfResults = results.length;
    }
    return await Promise.all(proposalPromises).then((values) =>
      values.reverse()
    );
  }

  async getProposal(id: ProposalId): Promise<PolygonProposal> {
    const proposal = await this.ethereumZDAO.getProposalById(id);
    if (proposal.proposalId.toString() !== id) {
      throw new NotFoundError(errorMessageForError('not-found-proposal'));
    }

    const executed = await this.gnosisSafeClient.isProposalsExecuted(
      PlatformType.Snapshot,
      [ProposalClient.getProposalHash(this.id, proposal.proposalId.toString())]
    );

    return await ProposalClient.createInstance(
      this,
      await this.mapToProperties(proposal, executed[0])
    );
  }

  async createProposal(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string | undefined,
    payload: CreatePolygonProposalParams
  ): Promise<ProposalId> {
    // zDAO should be active
    if (this.destroyed) {
      throw new AlreadyDestroyedError();
    }
    if (!this.votingDuration) {
      throw new Error(errorMessageForError('invalid-proposal-duration'));
    }

    if (payload.transfer) {
      if (payload.choices && payload.choices.length !== 2) {
        throw new Error(
          errorMessageForError('invalid-choices-for-funding-proposal')
        );
      }
    }
    if (!payload.choices) {
      payload.choices = DEFAULT_PROPOSAL_CHOICES;
    }

    const signer = getSigner(provider, account);
    const signerAddress = await signer.getAddress();

    // signer should have valid amount of voting token on Ethereum
    const balance = await this.rootTokenContract.balanceOf(signerAddress);
    if (balance.lt(this.minimumVotingTokenAmount)) {
      throw new InvalidError(
        errorMessageForError('should-hold-token', {
          amount: getFullDisplayBalance(
            BigNumber.from(this.minimumVotingTokenAmount),
            this.votingToken.decimals
          ),
        })
      );
    }

    // zDAO should be synchronized to Polygon prior to create proposal
    const polygonZDAO = await this.getPolygonZDAOContract();
    if (!polygonZDAO) {
      throw new NotSyncStateError();
    }

    try {
      const ipfs = await AbstractDAOClient.uploadToIPFS(signer, payload);

      await GlobalClient.ethereumZDAOChef.createProposal(
        signer,
        this.id,
        payload,
        ipfs
      );

      // created proposal id
      const lastProposalId = (
        await this.ethereumZDAO.lastProposalId()
      ).toString();

      return lastProposalId;
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }

  async isCheckPointed(txHash: string) {
    return ProofClient.isCheckPointed(txHash);
  }
}

export default DAOClient;
