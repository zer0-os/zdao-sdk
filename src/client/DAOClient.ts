import { BigNumber, ethers } from 'ethers';

import { IPFSGatway } from '../config';
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
import { ipfsJson } from '../utilities/ipfs';
import { errorMessageForError } from '../utilities/messages';
import AbstractDAOClient from './AbstractDAOClient';
import ProposalClient from './ProposalClient';

class DAOClient extends AbstractDAOClient {
  protected _etherZDAOChef!: EtherZDAOChefClient;
  protected _polyZDAOChef!: PolyZDAOChefClient;
  protected _etherZDAO!: EtherZDAO;
  protected _polyZDAO: PolyZDAO | null = null;

  private constructor(
    properties: zDAOProperties,
    gnosisSafeClient: GnosisSafeClient,
    etherZDAOChef: EtherZDAOChefClient,
    polyZDAOChef: PolyZDAOChefClient
  ) {
    super(properties, gnosisSafeClient);
    this._etherZDAOChef = etherZDAOChef;
    this._polyZDAOChef = polyZDAOChef;

    return (async () => {
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
    const zDAOProperties = await etherZDAOChef.getZDAOProperties(zNA);

    return await new DAOClient(
      zDAOProperties as zDAOProperties,
      new GnosisSafeClient(config.gnosisSafe),
      etherZDAOChef,
      polyZDAOChef
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
    const start = new Date(Number(raw.startTimestamp) * 1000),
      end = new Date(Number(raw.endTimestamp) * 1000),
      now = new Date();

    const mapState = (raw: IEtherZDAO.ProposalStruct): ProposalState => {
      if (raw.canceled) {
        return 'canceled';
      } else if (now <= start) {
        return 'pending';
      } else if (now <= end) {
        return 'active';
      } else if (
        BigNumber.from(raw.yes) <= BigNumber.from(raw.no) ||
        BigNumber.from(raw.yes) < BigNumber.from(this.quorumVotes)
      ) {
        return 'failed';
      } else if (raw.executed) {
        return 'executed';
      }
      return 'succeeded';
    };

    const ipfsData = await ipfsJson(raw.ipfs.toString(), IPFSGatway);
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
      scores: undefined, // todo, pull from Polygon chain
      voters: undefined, // todo
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
    const count = 3000;
    let from = 0;
    let numberOfResults = count;
    const proposals: Proposal[] = [];
    while (numberOfResults === count) {
      const results: IEtherZDAO.ProposalStructOutput[] =
        await this._etherZDAO.listProposals(from, count);

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
      throw new Error(errorMessageForError('not-found-proposal'));
    }

    return new ProposalClient(await this.mapToProperties(proposal), this);
  }

  async createProposal(
    signer: ethers.Wallet,
    payload: CreateProposalParams
  ): Promise<Proposal> {
    const tx = await this._etherZDAOChef.createProposal(
      signer,
      this.id,
      payload
    );
    await tx.wait();

    // created proposal id
    const lastProposalId = (await this._etherZDAO.lastProposalId()).toString();

    return await this.getProposal(lastProposalId);
  }
}

export default DAOClient;
