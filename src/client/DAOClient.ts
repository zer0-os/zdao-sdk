import { BigNumber, ethers } from 'ethers';

import { IPFSGatway } from '../config';
import IERC20UpgradeableAbi from '../config/abi/IERC20Upgradeable.json';
import { EtherZDAO, IEtherZDAO } from '../config/types/EtherZDAO';
import { PolyZDAO } from '../config/types/PolyZDAO';
import { EtherZDAOChefClient } from '../ethereum';
import { GnosisSafeClient } from '../gnosis-safe';
import { PolyZDAOChefClient } from '../polygon';
import {
  Config,
  CreateProposalParams,
  Proposal,
  ProposalId,
  ProposalProperties,
  ProposalState,
  VoteChoice,
  zDAOProperties,
  zNA,
} from '../types';
import { NotFoundError, NotSyncStateError } from '../types/error';
import { errorMessageForError } from '../utilities/messages';
import AbstractDAOClient from './AbstractDAOClient';
import IPFSClient from './IPFSClient';
import ProposalClient from './ProposalClient';

class DAOClient extends AbstractDAOClient {
  protected _etherZDAOChef!: EtherZDAOChefClient;
  protected _polyZDAOChef!: PolyZDAOChefClient;
  protected _etherZDAO!: EtherZDAO;
  protected _polyZDAO: PolyZDAO | null = null;
  protected _totalSupply: BigNumber;

  private constructor(
    properties: zDAOProperties,
    gnosisSafeClient: GnosisSafeClient,
    etherZDAOChef: EtherZDAOChefClient,
    polyZDAOChef: PolyZDAOChefClient,
    totalSupply: BigNumber
  ) {
    super(properties, gnosisSafeClient);
    this._etherZDAOChef = etherZDAOChef;
    this._polyZDAOChef = polyZDAOChef;
    this._totalSupply = totalSupply;

    return (async (): Promise<DAOClient> => {
      this._etherZDAO = await this._etherZDAOChef.getZDAOById(
        this._properties.id
      );
      this._polyZDAO = await this.getPolyZDAO();
      return this;
    })() as unknown as DAOClient;
  }

  get etherZDAOChef() {
    return this._etherZDAOChef;
  }

  get polyZDAOChef() {
    return this._polyZDAOChef;
  }

  get etherZDAO() {
    return this._etherZDAO;
  }

  static async createInstance(config: Config, zNA: zNA): Promise<DAOClient> {
    const etherZDAOChef = new EtherZDAOChefClient(config.ethereum);
    const polyZDAOChef = new PolyZDAOChefClient(config.polygon);
    const zDAOProperties = await etherZDAOChef.getZDAOPropertiesByZNA(zNA);

    const tokenContract = new ethers.Contract(
      zDAOProperties.token,
      IERC20UpgradeableAbi.abi,
      config.ethereum.provider
    );

    const totalSupply = await tokenContract.totalSupply();

    return await new DAOClient(
      zDAOProperties as zDAOProperties,
      new GnosisSafeClient(config.gnosisSafe),
      etherZDAOChef,
      polyZDAOChef,
      totalSupply
    );
  }

  async getPolyZDAO(): Promise<PolyZDAO | null> {
    if (this._polyZDAO) return this._polyZDAO;
    this._polyZDAO = await this._polyZDAOChef.getZDAOById(this._properties.id);
    return this._polyZDAO;
  }

  private async mapToProperties(
    raw: IEtherZDAO.ProposalStruct
  ): Promise<ProposalProperties> {
    const polyZDAO = await this.getPolyZDAO();
    const polyProposal = polyZDAO
      ? await polyZDAO.proposals(raw.proposalId)
      : null;
    const isSyncedProposal = polyProposal
      ? polyProposal.proposalId.eq(raw.proposalId)
      : false;

    const start =
        polyZDAO && polyProposal && isSyncedProposal
          ? new Date(Number(polyProposal.startTimestamp) * 1000)
          : undefined,
      end =
        polyZDAO && polyProposal && isSyncedProposal
          ? new Date(Number(polyProposal.endTimestamp) * 1000)
          : undefined,
      now = new Date();
    const scores =
      polyZDAO && polyProposal && isSyncedProposal
        ? [polyProposal.yes.toString(), polyProposal.no.toString()]
        : undefined;
    const voters =
      polyZDAO && polyProposal && isSyncedProposal
        ? polyProposal.voters.toNumber()
        : undefined;

    const mapState = (raw: IEtherZDAO.ProposalStruct): ProposalState => {
      if (raw.canceled) {
        return 'canceled';
      } else if (!start || !end || !scores || !voters) {
        return 'pending';
      } else if (now <= end) {
        return 'active';
      } else if (raw.executed) {
        return 'executed';
      }

      const yes = BigNumber.from(scores[0]),
        no = BigNumber.from(scores[1]),
        zero = BigNumber.from(0);
      if (
        voters < this._properties.quorumParticipants ||
        yes.add(no).lt(BigNumber.from(this._properties.quorumVotes)) // <
      ) {
        return 'failed';
      }

      // if relative majority, the denominator should be sum of yes and no votes
      if (
        this._properties.isRelativeMajority &&
        yes.add(no).gt(zero) &&
        yes
          .mul(BigNumber.from(10000))
          .div(yes.add(no))
          .gte(BigNumber.from(this._properties.threshold))
      ) {
        return 'succeeded';
      }

      // if absolute majority, the denominator should be total supply
      if (
        !this._properties.isRelativeMajority &&
        this._totalSupply.gt(zero) &&
        yes
          .mul(10000)
          .div(this._totalSupply)
          .gte(BigNumber.from(this._properties.threshold))
      ) {
        return 'succeeded';
      }
      return 'failed';
    };

    const ipfsData = await IPFSClient.getJson(raw.ipfs.toString(), IPFSGatway);
    const metadataJson = JSON.parse(ipfsData.data.message.metadata);

    return {
      id: raw.proposalId.toString(),
      createdBy: raw.createdBy,
      title: ipfsData.data.message.title,
      body: ipfsData.data.message.body,
      ipfs: raw.ipfs.toString(),
      choices: Object.values(VoteChoice),
      start,
      end,
      state: mapState(raw),
      snapshot: Number(raw.snapshot),
      scores,
      voters,
      metadata: {
        abi: metadataJson.abi,
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
    const count = (await this._etherZDAO.numberOfProposals()).toNumber();
    const limit = 100;
    let from = 1;
    let numberOfResults = limit;
    const proposals: Proposal[] = [];

    while (numberOfResults === limit) {
      const results: IEtherZDAO.ProposalStructOutput[] =
        await this._etherZDAO.listProposals(
          from,
          Math.min(from + limit - 1, count)
        );

      const promises: Promise<ProposalProperties>[] = [];
      promises.push(
        ...results.map((proposal) => this.mapToProperties(proposal))
      );

      const propertiesAll: ProposalProperties[] = await Promise.all(promises);
      proposals.push(
        ...propertiesAll.map(
          (properties) => new ProposalClient(properties, this)
        )
      );

      from += results.length;
      numberOfResults = results.length;
    }
    return proposals;
  }

  async getProposal(id: ProposalId): Promise<Proposal> {
    const proposal = await this._etherZDAO.proposals(id);
    if (proposal.proposalId.toString() !== id) {
      throw new NotFoundError(errorMessageForError('not-found-proposal'));
    }

    return new ProposalClient(await this.mapToProperties(proposal), this);
  }

  async createProposal(
    signer: ethers.Wallet,
    payload: CreateProposalParams
  ): Promise<Proposal> {
    const polyZDAO = await this.getPolyZDAO();
    if (!polyZDAO) {
      throw new NotSyncStateError();
    }

    const ipfs = await this.uploadToIPFS(
      signer,
      payload,
      this.polyZDAOChef.config.zDAOChef
    );

    await this._etherZDAOChef.createProposal(signer, this.id, payload, ipfs);

    // created proposal id
    const lastProposalId = (await this._etherZDAO.lastProposalId()).toString();

    return await this.getProposal(lastProposalId);
  }
}

export default DAOClient;
