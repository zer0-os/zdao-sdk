import { BigNumber, ethers, Signer } from 'ethers';

import { IPFSGatway } from '../config';
import IERC20UpgradeableAbi from '../config/abi/IERC20Upgradeable.json';
import { EtherZDAO, IEtherZDAO } from '../config/types/EtherZDAO';
import { PolyZDAO } from '../config/types/PolyZDAO';
import { GnosisSafeClient } from '../gnosis-safe';
import {
  Config,
  CreateProposalParams,
  Proposal,
  ProposalId,
  ProposalProperties,
  ProposalState,
  VoteChoice,
  zDAOId,
  zDAOProperties,
} from '../types';
import {
  AlreadyDestroyedError,
  FailedTxError,
  InvalidError,
  NotFoundError,
  NotSyncStateError,
} from '../types/error';
import { errorMessageForError } from '../utilities/messages';
import { getDecimalAmount, getFullDisplayBalance } from '../utilities/number';
import AbstractDAOClient from './AbstractDAOClient';
import GlobalClient from './GlobalClient';
import IPFSClient from './IPFSClient';
import ProofClient from './ProofClient';
import ProposalClient from './ProposalClient';

class DAOClient extends AbstractDAOClient {
  protected _etherZDAO!: EtherZDAO;
  protected _polyZDAO: PolyZDAO | null = null;
  protected _rootTokenContract!: ethers.Contract;
  protected _totalSupply!: BigNumber;

  private constructor(
    properties: zDAOProperties,
    gnosisSafeClient: GnosisSafeClient
  ) {
    super(properties, gnosisSafeClient);

    return (async (): Promise<DAOClient> => {
      this._rootTokenContract = new ethers.Contract(
        properties.rootToken,
        IERC20UpgradeableAbi.abi,
        GlobalClient.etherRpcProvider
      );
      this._totalSupply = await this._rootTokenContract.totalSupply();

      this._etherZDAO = await GlobalClient.etherZDAOChef.getZDAOById(
        this._properties.id
      );
      this._polyZDAO = await this.getPolyZDAO();
      if (this._polyZDAO) {
        this._properties.state = 'active';
      }
      if (properties.destroyed) {
        this._properties.state = 'canceled';
      }
      return this;
    })() as unknown as DAOClient;
  }

  get etherZDAO() {
    return this._etherZDAO;
  }

  get totalSupply() {
    return this._totalSupply;
  }

  static async createInstance(
    config: Config,
    zDAOId: zDAOId
  ): Promise<DAOClient> {
    const zDAOProperties =
      await GlobalClient.etherZDAOChef.getZDAOPropertiesById(zDAOId);

    const childToken = await GlobalClient.registry.rootToChildToken(
      zDAOProperties.rootToken
    );

    return await new DAOClient(
      {
        ...zDAOProperties,
        childToken,
        state: 'pending',
      },
      new GnosisSafeClient(config.gnosisSafe)
    );
  }

  async getPolyZDAO(): Promise<PolyZDAO | null> {
    if (this._polyZDAO) return this._polyZDAO;
    this._polyZDAO = await GlobalClient.polyZDAOChef.getZDAOById(
      this._properties.id
    );
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
    const snapshot =
      polyZDAO && polyProposal && isSyncedProposal
        ? polyProposal.snapshot.toNumber()
        : undefined;
    const scores =
      polyZDAO && polyProposal && isSyncedProposal
        ? [polyProposal.yes.toString(), polyProposal.no.toString()]
        : undefined;
    const voters =
      polyZDAO && polyProposal && isSyncedProposal
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

    const mapState = (raw: IEtherZDAO.ProposalStruct): ProposalState => {
      if (raw.canceled) {
        return 'canceled';
      } else if (
        start === undefined ||
        end === undefined ||
        scores === undefined ||
        voters === undefined
      ) {
        return 'pending';
      } else if (now <= end) {
        return 'active';
      } else if (raw.executed) {
        return 'executed';
      } else if (raw.calculated) {
        return canExecute() ? 'awaiting-execution' : 'failed';
      } else if (polyProposal?.calculated) {
        return 'awaiting-finalization';
      }
      return 'awaiting-calculation';
    };

    const ipfsData = await IPFSClient.getJson(raw.ipfs.toString(), IPFSGatway);
    const metadataJson = JSON.parse(ipfsData.data.message.metadata);

    return {
      id: raw.proposalId.toString(),
      createdBy: raw.createdBy,
      title: ipfsData.data.message.title,
      body: ipfsData.data.message.body,
      ipfs: raw.ipfs.toString(),
      choices: [VoteChoice.YES, VoteChoice.NO],
      start,
      end,
      state: mapState(raw),
      snapshot,
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
    const count = 100;
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
      throw new NotFoundError(errorMessageForError('not-found-proposal'));
    }

    return new ProposalClient(await this.mapToProperties(proposal), this);
  }

  async createProposal(
    signer: Signer,
    payload: CreateProposalParams
  ): Promise<ProposalId> {
    // zDAO should be active
    if (this.destroyed) {
      throw new AlreadyDestroyedError();
    }

    // signer should have valid amount of voting token on Ethereum
    const account = await signer.getAddress();
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
    const polyZDAO = await this.getPolyZDAO();
    if (!polyZDAO) {
      throw new NotSyncStateError();
    }

    try {
      const ipfs = await this.uploadToIPFS(signer, payload);

      await GlobalClient.etherZDAOChef.createProposal(
        signer,
        this.id,
        payload,
        ipfs
      );

      // created proposal id
      const lastProposalId = (
        await this._etherZDAO.lastProposalId()
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

  async syncState(signer: Signer, txHash: string) {
    // zDAO should be active
    if (this.destroyed) {
      throw new AlreadyDestroyedError();
    }
    try {
      const proof = await ProofClient.generate(txHash);
      return await GlobalClient.etherZDAOChef.receiveMessage(signer, proof);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }
}

export default DAOClient;
