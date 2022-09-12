import { BigNumber, ethers } from 'ethers';
import { cloneDeep } from 'lodash';

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
  trimHexString,
} from '../../utilities';
import { EthereumZDAO } from '../config/types/EthereumZDAO';
import { PolygonZDAO as PolygonZDAOContract } from '../config/types/PolygonZDAO';
import { EthereumSubgraphProposal } from '../ethereum/types';
import { PolygonSubgraphProposal } from '../polygon/types';
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

    this.rootTokenContract = IERC20Upgradeable__factory.connect(
      properties.votingToken.token,
      GlobalClient.etherRpcProvider
    );
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

    const etherZDAOInfo = zDAOInfos[0];
    const polyZDAOInfo = zDAOInfos[1];

    if (!etherZDAOInfo) {
      throw new NotFoundError(errorMessageForError('not-found-zdao'));
    }

    const tokens = await Promise.all([
      getToken(GlobalClient.etherRpcProvider, etherZDAOInfo.token),
      polyZDAOInfo &&
        getToken(GlobalClient.polyRpcProvider, polyZDAOInfo.token),
      getTotalSupply(GlobalClient.etherRpcProvider, etherZDAOInfo.token).catch(
        () => {
          throw new InvalidError(
            errorMessageForError('not-support-total-supply')
          );
        }
      ),
    ]);

    const instance = new DAOClient(
      {
        id: zDAORecord.id,
        zNAs: zDAORecord.associatedzNAs,
        name: zDAORecord.name,
        createdBy: etherZDAOInfo.createdBy,
        network: GlobalClient.etherNetwork,
        gnosisSafe: etherZDAOInfo.gnosisSafe,
        votingToken: tokens[0] as Token,
        minimumVotingTokenAmount: etherZDAOInfo.amount.toString(),
        totalSupplyOfVotingToken: tokens[2].toString(),
        votingDuration: etherZDAOInfo.duration,
        votingDelay: etherZDAOInfo.votingDelay,
        votingThreshold: etherZDAOInfo.votingThreshold,
        minimumVotingParticipants: etherZDAOInfo.minimumVotingParticipants,
        minimumTotalVotingTokens:
          etherZDAOInfo.minimumTotalVotingTokens.toString(),
        isRelativeMajority: etherZDAOInfo.isRelativeMajority,
        state: etherZDAOInfo.destroyed
          ? zDAOState.CANCELED
          : polyZDAOInfo
          ? zDAOState.ACTIVE
          : zDAOState.PENDING,
        snapshot: etherZDAOInfo.snapshot,
        destroyed: etherZDAOInfo.destroyed,
        polygonToken: tokens[1] as Token,
      },
      new GnosisSafeClient(config.gnosisSafe)
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
    ethereumRawProposal: EthereumSubgraphProposal,
    polygonRawProposal: PolygonSubgraphProposal | undefined
  ): Promise<ProposalProperties> {
    const created = new Date(ethereumRawProposal.created * 1000);
    const start = polygonRawProposal
        ? new Date(Number(polygonRawProposal.startTimestamp) * 1000)
        : undefined,
      end = polygonRawProposal
        ? new Date(Number(polygonRawProposal.endTimestamp) * 1000)
        : undefined,
      now = new Date();
    const snapshot = polygonRawProposal?.snapshot;
    const scores = polygonRawProposal?.sumOfVotes;
    const voters = polygonRawProposal?.voters;

    const mapState = (): ProposalState => {
      if (ethereumRawProposal.canceled) {
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
      } else if (ethereumRawProposal.calculated) {
        return ProposalState.CLOSED;
      } else if (polygonRawProposal?.calculated) {
        return ProposalState.AWAITING_FINALIZATION;
      }
      return ProposalState.AWAITING_CALCULATION;
    };

    const ipfsData = await IPFSClient.getJson(
      ethereumRawProposal.ipfs.toString(),
      GlobalClient.ipfsGateway
    );
    const metadataJson =
      ipfsData.data.message && ipfsData.data.message.transfer;

    return {
      id: ethereumRawProposal.proposalId,
      createdBy: ethereumRawProposal.createdBy,
      title: ipfsData.data.message.title,
      body: ipfsData.data.message.body,
      ipfs: ethereumRawProposal.ipfs.toString(),
      choices: [VoteChoice.YES, VoteChoice.NO],
      created,
      start,
      end,
      state: mapState(),
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
    const subgraphProposals = await Promise.all([
      GlobalClient.ethereumZDAOChef.listProposals(this.id),
      GlobalClient.polygonZDAOChef.listProposals(this.id),
    ]);

    const ethereumSubgraphProposals = subgraphProposals[0];
    const polygonSubgraphProposals = subgraphProposals[1];

    const promises: Promise<ProposalProperties>[] =
      ethereumSubgraphProposals.map((ethereumRawProposal) =>
        this.mapToProperties(
          ethereumRawProposal,
          polygonSubgraphProposals.find(
            (item) => item.proposalId === ethereumRawProposal.proposalId
          )
        )
      );

    const propertiesAll: ProposalProperties[] = await Promise.all(promises);

    const proposals: PolygonProposal[] = propertiesAll.map((properties) =>
      ProposalClient.createInstance(this, properties)
    );
    return proposals;
  }

  async getProposal(id: ProposalId): Promise<PolygonProposal> {
    const subgraphProposal = await Promise.all([
      GlobalClient.ethereumZDAOChef.getProposal(this.id, id),
      GlobalClient.polygonZDAOChef.getProposal(this.id, id),
    ]);

    const ethereumSubgraphProposal = subgraphProposal[0];
    const polygonSubgraphProposal = subgraphProposal[1];
    if (!ethereumSubgraphProposal) {
      throw new NotFoundError(errorMessageForError('not-found-proposal'));
    }

    const properties = await this.mapToProperties(
      ethereumSubgraphProposal,
      polygonSubgraphProposal
    );
    return ProposalClient.createInstance(this, properties);
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
      payload.choices = DEFAULT_PROPOSAL_CHOICES;
    }
    if (!payload.choices || payload.choices.length < 1) {
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

    const ipfs = await AbstractDAOClient.uploadToIPFS(signer, payload);
    try {
      const proposalId = await GlobalClient.ethereumZDAOChef.createProposal(
        signer,
        this.id,
        payload,
        ipfs
      );
      return trimHexString(proposalId.toHexString());
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
