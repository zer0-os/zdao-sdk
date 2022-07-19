import { BigNumber, ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import { AbstractDAOClient, GnosisSafeClient, IPFSClient } from '../../client';
import { ZDAORecord } from '../../client/ZDAORegistry';
import IERC20UpgradeableAbi from '../../config/abi/IERC20Upgradeable.json';
import {
  AlreadyDestroyedError,
  FailedTxError,
  InvalidError,
  NotFoundError,
  NotSyncStateError,
  ProposalId,
  ProposalProperties,
  ProposalState,
  zDAOProperties,
  zDAOState,
} from '../../types';
import {
  errorMessageForError,
  getFullDisplayBalance,
  getSigner,
  getToken,
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
  protected polygonZDAOContract: PolygonZDAOContract | null = null;
  protected rootTokenContract!: ethers.Contract;
  protected totalSupplyAsBN!: BigNumber;

  private constructor(
    properties: zDAOProperties & zDAOOptions,
    gnosisSafeClient: GnosisSafeClient
  ) {
    super(properties, gnosisSafeClient);
    this.zDAOOptions = cloneDeep(properties);

    return (async (): Promise<DAOClient> => {
      this.rootTokenContract = new ethers.Contract(
        properties.votingToken.token,
        IERC20UpgradeableAbi.abi,
        GlobalClient.etherRpcProvider
      );

      const promises: Promise<any>[] = [
        this.rootTokenContract.totalSupply(),
        GlobalClient.ethereumZDAOChef.getZDAOById(this.properties.id),
        this.getPolygonZDAOContract(),
      ];
      const results = await Promise.all(promises);

      this.totalSupplyAsBN = results[0] as BigNumber;
      this.ethereumZDAO = results[1] as EthereumZDAO;
      this.polygonZDAOContract = results[2] as PolygonZDAOContract;

      // this.totalSupplyAsBN = await this.rootTokenContract.totalSupply()

      // this.ethereumZDAO = await GlobalClient.ethereumZDAOChef.getZDAOById(
      //   this.properties.id
      // );
      // this.polygonZDAOContract = await this.getPolygonZDAOContract();
      if (this.polygonZDAOContract) {
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

  get totalSupply() {
    return this.totalSupplyAsBN;
  }

  static async createInstance(
    config: PolygonConfig,
    zDAORecord: ZDAORecord
  ): Promise<PolygonZDAO> {
    const zDAOProperties =
      await GlobalClient.ethereumZDAOChef.getZDAOPropertiesById(zDAORecord);
    const polygonTokenAddress =
      await GlobalClient.registry.ethereumToPolygonToken(
        zDAOProperties.votingToken.token
      );

    const polygonToken = await getToken(
      GlobalClient.polyRpcProvider,
      polygonTokenAddress
    );
    const instance = await new DAOClient(
      {
        ...zDAOProperties,
        state: zDAOState.PENDING,
        polygonToken: polygonToken,
      },
      new GnosisSafeClient(config.gnosisSafe, config.ipfsGateway)
    );
    return instance;
  }

  async getPolygonZDAOContract(): Promise<PolygonZDAOContract | null> {
    if (this.polygonZDAOContract) return this.polygonZDAOContract;
    this.polygonZDAOContract = await GlobalClient.polygonZDAOChef.getZDAOById(
      this.properties.id
    );
    return this.polygonZDAOContract;
  }

  private async mapToProperties(
    raw: IEthereumZDAO.ProposalStruct
  ): Promise<ProposalProperties> {
    const polygonZDAOContract = await this.getPolygonZDAOContract();
    const polyProposal = polygonZDAOContract
      ? await polygonZDAOContract.proposals(raw.proposalId)
      : null;
    const isSyncedProposal = polyProposal
      ? polyProposal.proposalId.eq(raw.proposalId)
      : false;

    const created = new Date(Number(raw.created) * 1000);
    const start =
        polygonZDAOContract && polyProposal && isSyncedProposal
          ? new Date(Number(polyProposal.startTimestamp) * 1000)
          : undefined,
      end =
        polygonZDAOContract && polyProposal && isSyncedProposal
          ? new Date(Number(polyProposal.endTimestamp) * 1000)
          : undefined,
      now = new Date();
    const snapshot =
      polygonZDAOContract && polyProposal && isSyncedProposal
        ? polyProposal.snapshot.toNumber()
        : undefined;
    const scores =
      polygonZDAOContract && polyProposal && isSyncedProposal
        ? [polyProposal.yes.toString(), polyProposal.no.toString()]
        : undefined;
    const voters =
      polygonZDAOContract && polyProposal && isSyncedProposal
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
      scores,
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
    return await Promise.all(proposalPromises).then((values) =>
      values.reverse()
    );
  }

  async getProposal(id: ProposalId): Promise<PolygonProposal> {
    const proposal = await this.ethereumZDAO.proposals(id);
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
    account: string | undefined,
    payload: CreatePolygonProposalParams
  ): Promise<ProposalId> {
    // zDAO should be active
    if (this.destroyed) {
      throw new AlreadyDestroyedError();
    }
    if (!this.duration) {
      throw new Error(errorMessageForError('invalid-proposal-duration'));
    }

    // signer should have valid amount of voting token on Ethereum
    const balance = await this.rootTokenContract.balanceOf(account);
    if (balance.lt(this.amount)) {
      throw new InvalidError(
        errorMessageForError('should-hold-token', {
          amount: getFullDisplayBalance(
            BigNumber.from(this.amount),
            this.votingToken.decimals
          ),
        })
      );
    }

    // zDAO should be synchronized to Polygon prior to create proposal
    const PolygonZDAOContract = await this.getPolygonZDAOContract();
    if (!PolygonZDAOContract) {
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
