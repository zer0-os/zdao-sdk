import { BigNumber, ethers } from 'ethers';

import IPFSClient from '../../client/IPFSClient';
import { GnosisSafeClient } from '../../gnosis-safe';
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
  zDAO,
  zDAOId,
  zDAOProperties,
  zDAOState,
} from '../../types';
import {
  errorMessageForError,
  getDecimalAmount,
  getFullDisplayBalance,
  getToken,
} from '../../utilities';
import { IPFSGatway } from '../config';
import IERC20UpgradeableAbi from '../config/abi/IERC20Upgradeable.json';
import { EtherZDAO, IEtherZDAO } from '../config/types/EtherZDAO';
import { PolyZDAO } from '../config/types/PolyZDAO';
import { Config, VoteChoice } from '../types';
import AbstractDAOClient from './AbstractDAOClient';
import GlobalClient from './GlobalClient';
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
        properties.votingToken.token,
        IERC20UpgradeableAbi.abi,
        GlobalClient.etherRpcProvider
      );
      this._totalSupply = await this._rootTokenContract.totalSupply();

      this._etherZDAO = await GlobalClient.etherZDAOChef.getZDAOById(
        this._properties.id
      );
      this._polyZDAO = await this.getPolyZDAO();
      if (this._polyZDAO) {
        this._properties.state = zDAOState.ACTIVE;
      }
      if (properties.destroyed) {
        this._properties.state = zDAOState.CANCELED;
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

  static async createInstance(config: Config, zDAOId: zDAOId): Promise<zDAO> {
    const zDAOProperties =
      await GlobalClient.etherZDAOChef.getZDAOPropertiesById(zDAOId);

    const childTokenAddress = await GlobalClient.registry.rootToChildToken(
      zDAOProperties.votingToken.token
    );
    const childToken = await getToken(
      GlobalClient.polyRpcProvider,
      childTokenAddress
    );

    return await new DAOClient(
      {
        ...zDAOProperties,
        state: zDAOState.PENDING,
        options: {
          polygonToken: childToken,
        },
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

    const created = new Date(Number(raw.created) * 1000);
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

    const ipfsData = await IPFSClient.getJson(raw.ipfs.toString(), IPFSGatway);
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
    const polyZDAO = await this.getPolyZDAO();
    if (!polyZDAO) {
      throw new NotSyncStateError();
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const signer = provider?.getSigner ? provider.getSigner() : provider;
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

  async syncState(signer: ethers.Signer, txHash: string) {
    // zDAO should be active
    if (this.destroyed) {
      throw new AlreadyDestroyedError();
    }
    try {
      const proof = await ProofClient.generate(txHash);
      await GlobalClient.etherZDAOChef.receiveMessage(signer, proof);
    } catch (error: any) {
      const errorMsg = error?.data?.message ?? error.message;
      throw new FailedTxError(errorMsg);
    }
  }
}

export default DAOClient;
