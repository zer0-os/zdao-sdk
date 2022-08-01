import { BigNumber, ethers } from 'ethers';
import { cloneDeep } from 'lodash';

import { AbstractDAOClient, GnosisSafeClient, IPFSClient } from '../../client';
import { ZDAORecord } from '../../client/ZDAORegistry';
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

    const etherZDAOInfo = zDAOInfos[0];
    const instance = await new DAOClient(
      {
        id: zDAORecord.id,
        zNAs: zDAORecord.associatedzNAs,
        name: zDAORecord.name,
        createdBy: etherZDAOInfo.createdBy,
        network: config.ethereum.network,
        gnosisSafe: etherZDAOInfo.gnosisSafe,
        votingToken: tokens[0] as Token,
        amount: etherZDAOInfo.amount.toString(),
        totalSupplyOfVotingToken: tokens[2].toString(),
        duration: etherZDAOInfo.duration.toNumber(),
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
    raw: IEthereumZDAO.ProposalStruct
  ): Promise<ProposalProperties> {
    const polygonZDAO = await this.getPolygonZDAOContract();
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

      const totalSupply = BigNumber.from(this.totalSupplyOfVotingToken);

      // if absolute majority, the denominator should be total supply
      if (
        !this.isRelativeMajority &&
        totalSupply.gt(zero) &&
        yes
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

    const signer = getSigner(provider, account);
    const signerAddress = await signer.getAddress();

    // signer should have valid amount of voting token on Ethereum
    const balance = await this.rootTokenContract.balanceOf(signerAddress);
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
