import { BigNumber, ethers } from 'ethers';

import { AbstractDAOClient, GnosisSafeClient, IPFSClient } from '../../client';
import IERC20UpgradeableAbi from '../../config/abi/IERC20Upgradeable.json';
import {
  AlreadyDestroyedError,
  CreateProposalParams,
  FailedTxError,
  InvalidError,
  NotFoundError,
  NotSyncStateError,
  Proposal,
  ProposalId,
  ProposalProperties,
  ProposalState,
  zDAOId,
  zDAOProperties,
  zDAOState,
} from '../../types';
import {
  errorMessageForError,
  getDecimalAmount,
  getFullDisplayBalance,
  getSigner,
  getToken,
} from '../../utilities';
import { EthereumZDAO, IEthereumZDAO } from '../config/types/EthereumZDAO';
import { PolygonZDAO } from '../config/types/PolygonZDAO';
import { Config, VoteChoice, zDAO } from '../types';
import GlobalClient from './GlobalClient';
import ProofClient from './ProofClient';
import ProposalClient from './ProposalClient';

class DAOClient extends AbstractDAOClient implements zDAO {
  protected _ethereumZDAO!: EthereumZDAO;
  protected _polygonZDAO: PolygonZDAO | null = null;
  protected _rootTokenContract!: ethers.Contract;
  protected _totalSupply!: BigNumber;

  private constructor(
    properties: zDAOProperties,
    gnosisSafeClient: GnosisSafeClient
  ) {
    super(properties, gnosisSafeClient);

    return (async (): Promise<DAOClient> => {
      this._rootTokenContract = new ethers.Contract(
        properties.votingToken.token,
        IERC20UpgradeableAbi.abi,
        GlobalClient.etherRpcProvider
      );
      this._totalSupply = await this._rootTokenContract.totalSupply();

      this._ethereumZDAO = await GlobalClient.ethereumZDAOChef.getZDAOById(
        this._properties.id
      );
      this._polygonZDAO = await this.getPolygonZDAO();
      if (this._polygonZDAO) {
        this._properties.state = zDAOState.ACTIVE;
      }
      if (properties.destroyed) {
        this._properties.state = zDAOState.CANCELED;
      }
      return this;
    })() as unknown as DAOClient;
  }

  get ethereumZDAO() {
    return this._ethereumZDAO;
  }

  get totalSupply() {
    return this._totalSupply;
  }

  static async createInstance(config: Config, zDAOId: zDAOId): Promise<zDAO> {
    const zDAOProperties =
      await GlobalClient.ethereumZDAOChef.getZDAOPropertiesById(zDAOId);

    const polygonTokenAddress =
      await GlobalClient.registry.ethereumToPolygonToken(
        zDAOProperties.votingToken.token
      );
    const polygonToken = await getToken(
      GlobalClient.polyRpcProvider,
      polygonTokenAddress
    );

    return await new DAOClient(
      {
        ...zDAOProperties,
        state: zDAOState.PENDING,
        options: {
          polygonToken: polygonToken,
        },
      },
      new GnosisSafeClient(config.gnosisSafe, config.ipfsGateway)
    );
  }

  async getPolygonZDAO(): Promise<PolygonZDAO | null> {
    if (this._polygonZDAO) return this._polygonZDAO;
    this._polygonZDAO = await GlobalClient.polygonZDAOChef.getZDAOById(
      this._properties.id
    );
    return this._polygonZDAO;
  }

  private async mapToProperties(
    raw: IEthereumZDAO.ProposalStruct
  ): Promise<ProposalProperties> {
    const polygonZDAO = await this.getPolygonZDAO();
    const polyProposal = polygonZDAO
      ? await polygonZDAO.proposals(raw.proposalId)
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
        ? [polyProposal.yes.toString(), polyProposal.no.toString()]
        : undefined;
    const voters =
      polygonZDAO && polyProposal && isSyncedProposal
        ? polyProposal.voters.toNumber()
        : undefined;

    const canExecute = (): boolean => {
      if (!scores || !voters) return false;

      const yes = BigNumber.from(scores[0]),
        no = BigNumber.from(scores[1]),
        zero = BigNumber.from(0);
      if (
        voters < this.minimumVotingParticipants ||
        yes.add(no).lt(BigNumber.from(this.minimumTotalVotingTokens)) // <
      ) {
        return false;
      }

      // if relative majority, the denominator should be sum of yes and no votes
      if (
        this.isRelativeMajority &&
        yes.add(no).gt(zero) &&
        yes
          .mul(BigNumber.from(10000))
          .div(yes.add(no))
          .gte(BigNumber.from(this.votingThreshold))
      ) {
        return true;
      }

      // if absolute majority, the denominator should be total supply
      if (
        !this.isRelativeMajority &&
        this.totalSupply.gt(zero) &&
        yes
          .mul(10000)
          .div(this.totalSupply)
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
      } else if (raw.executed) {
        return ProposalState.EXECUTED;
      } else if (raw.calculated) {
        return canExecute()
          ? ProposalState.AWAITING_EXECUTION
          : ProposalState.FAILED;
      } else if (polyProposal?.calculated) {
        return ProposalState.AWAITING_FINALIZATION;
      }
      return ProposalState.AWAITING_CALCULATION;
    };

    const ipfsData = await IPFSClient.getJson(
      raw.ipfs.toString(),
      GlobalClient.ipfsGateway
    );
    const metadataJson = JSON.parse(ipfsData.data.message.metadata);

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
      scores,
      voters,
      metadata:
        !metadataJson.sender ||
        !metadataJson.recipient ||
        !metadataJson.token ||
        !metadataJson.amount
          ? undefined
          : {
              sender: metadataJson.sender,
              recipient: metadataJson.recipient,
              token: metadataJson.token,
              decimals: metadataJson.decimals ?? 18,
              symbol: metadataJson.symbol ?? 'zToken',
              amount: metadataJson.amount,
            },
    };
  }

  async listProposals(): Promise<Proposal[]> {
    const count = 100;
    let from = 0;
    let numberOfResults = count;

    const proposalPromises: Promise<Proposal>[] = [];

    while (numberOfResults === count) {
      const results: IEthereumZDAO.ProposalStructOutput[] =
        await this._ethereumZDAO.listProposals(from, count);

      const promises: Promise<ProposalProperties>[] = [];
      promises.push(
        ...results.map((proposal) => this.mapToProperties(proposal))
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
    return await Promise.all(proposalPromises);
  }

  async getProposal(id: ProposalId): Promise<Proposal> {
    const proposal = await this._ethereumZDAO.proposals(id);
    if (proposal.proposalId.toString() !== id) {
      throw new NotFoundError(errorMessageForError('not-found-proposal'));
    }

    return await ProposalClient.createInstance(
      this,
      await this.mapToProperties(proposal)
    );
  }

  async createProposal(
    provider: ethers.providers.Web3Provider | ethers.Wallet,
    account: string,
    payload: CreateProposalParams
  ): Promise<ProposalId> {
    // zDAO should be active
    if (this.destroyed) {
      throw new AlreadyDestroyedError();
    }

    // signer should have valid amount of voting token on Ethereum
    const balance = await this._rootTokenContract.balanceOf(account);
    if (balance.lt(this.amount)) {
      const decimals = await this._rootTokenContract.decimals();
      throw new InvalidError(
        errorMessageForError('should-hold-token', {
          amount: getFullDisplayBalance(
            getDecimalAmount(BigNumber.from(this.amount), decimals)
          ),
        })
      );
    }

    // zDAO should be synchronized to Polygon prior to create proposal
    const polygonZDAO = await this.getPolygonZDAO();
    if (!polygonZDAO) {
      throw new NotSyncStateError();
    }

    try {
      const signer = getSigner(provider, account);
      const ipfs = await AbstractDAOClient.uploadToIPFS(signer, payload);

      await GlobalClient.ethereumZDAOChef.createProposal(
        signer,
        this.id,
        payload,
        ipfs
      );

      // created proposal id
      const lastProposalId = (
        await this._ethereumZDAO.lastProposalId()
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
