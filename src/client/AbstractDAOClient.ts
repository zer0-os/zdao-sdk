import {
  Erc20Transfer as GnosisErc20Transfer,
  Erc721Transfer as GnosisErc721Transfer,
  NativeCoinTransfer as GnosisNativeCoinTransfer,
  Transaction as GnosisTransaction,
  Transfer as GnosisTransfer,
  TransferInfo as GnosisTransferInfo,
} from '@gnosis.pm/safe-react-gateway-sdk';
import { ethers } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { cloneDeep } from 'lodash';

import {
  AssetType,
  CreateProposalParams,
  NotImplementedError,
  Proposal,
  ProposalId,
  Transaction,
  TransactionStatus,
  TransactionType,
  TransferInfo,
  Vote,
  zDAO,
  zDAOAssets,
  zDAOCoins,
  zDAOCollectibles,
  zDAOProperties,
} from '../types';
import { timestamp } from '../utilities';
import GnosisSafeClient from './GnosisSafeClient';
import IPFSClient from './IPFSClient';

abstract class AbstractDAOClient<
  VoteT extends Vote,
  ProposalT extends Proposal<VoteT>
> implements zDAO<VoteT, ProposalT>
{
  protected readonly properties: zDAOProperties;
  public readonly gnosisSafeClient: GnosisSafeClient;

  constructor(properties: zDAOProperties, gnosisSafeClient: GnosisSafeClient) {
    this.properties = cloneDeep(properties);
    this.gnosisSafeClient = gnosisSafeClient;
  }

  get id() {
    return this.properties.id;
  }

  get zNAs() {
    return this.properties.zNAs;
  }

  get name() {
    return this.properties.name;
  }

  get createdBy() {
    return this.properties.createdBy;
  }

  get network() {
    return this.properties.network;
  }

  get gnosisSafe() {
    return this.properties.gnosisSafe;
  }

  get votingToken() {
    return this.properties.votingToken;
  }

  get minimumVotingTokenAmount() {
    return this.properties.minimumVotingTokenAmount;
  }

  get totalSupplyOfVotingToken() {
    return this.properties.totalSupplyOfVotingToken;
  }

  get votingDuration() {
    return this.properties.votingDuration;
  }

  get votingDelay() {
    return this.properties.votingDelay;
  }

  get votingThreshold() {
    return this.properties.votingThreshold;
  }

  get minimumVotingParticipants() {
    return this.properties.minimumVotingParticipants;
  }

  get minimumTotalVotingTokens() {
    return this.properties.minimumTotalVotingTokens;
  }

  get isRelativeMajority() {
    return this.properties.isRelativeMajority;
  }

  get state() {
    return this.properties.state;
  }

  get snapshot() {
    return this.properties.snapshot;
  }

  get destroyed() {
    return this.properties.destroyed;
  }

  async listAssetsCoins(): Promise<zDAOCoins> {
    const results = await this.gnosisSafeClient.listAssets(
      this.gnosisSafe,
      this.network.toString()
    );
    return {
      amountInUSD: Number(results.fiatTotal),
      coins: results.items.map((item: any) => ({
        type: item.tokenInfo.type as string as AssetType,
        address: item.tokenInfo.address,
        decimals: item.tokenInfo.decimals,
        symbol: item.tokenInfo.symbol,
        name: item.tokenInfo.name,
        logoUri: item.tokenInfo.logoUri ?? undefined,
        amount: item.balance,
        amountInUSD: Number(item.fiatBalance),
      })),
    };
  }

  async listAssetsCollectibles(): Promise<zDAOCollectibles> {
    const results = await this.gnosisSafeClient.listCollectibles(
      this.gnosisSafe,
      this.network.toString()
    );
    return results.map((item: any) => ({
      address: item.address,
      tokenName: item.tokenName,
      tokenSymbol: item.tokenSymbol,
      id: item.id,
      logoUri: item.logoUri,
      name: item.name,
      description: item.description,
      imageUri: item.imageUri,
      metadata: item.metadata,
      metadataUri: item.uri,
    }));
  }

  async listAssets(): Promise<zDAOAssets> {
    const results = await Promise.all([
      this.listAssetsCoins(),
      this.listAssetsCollectibles(),
    ]);
    const balances = results[0];
    const collectibles = results[1];

    return {
      ...balances,
      collectibles,
    };
  }

  async listTransactions(): Promise<Transaction[]> {
    const transactions: GnosisTransaction[] =
      await this.gnosisSafeClient.listTransactions(
        this.gnosisSafe,
        this.network.toString()
      );

    const mapToTransferInfo = (info: GnosisTransferInfo): TransferInfo => {
      if ((info.type as string) === AssetType.ERC20) {
        const typedInfo = info as GnosisErc20Transfer;
        return {
          type: AssetType.ERC20,
          tokenAddress: typedInfo.tokenAddress,
          tokenName: typedInfo.tokenName ?? undefined,
          tokenSymbol: typedInfo.tokenSymbol ?? undefined,
          logoUri: typedInfo.logoUri ?? undefined,
          decimals: typedInfo.decimals ?? undefined,
          value: typedInfo.value,
        };
      } else if ((info.type as string) === AssetType.ERC721) {
        const typedInfo = info as GnosisErc721Transfer;
        return {
          type: AssetType.ERC721,
          tokenAddress: typedInfo.tokenAddress,
          tokenId: typedInfo.tokenId,
          tokenName: typedInfo.tokenName ?? undefined,
          tokenSymbol: typedInfo.tokenSymbol ?? undefined,
          logoUri: typedInfo.logoUri ?? undefined,
        };
      } else {
        // AssetType.NATIVE_COIN
        const typedInfo = info as GnosisNativeCoinTransfer;
        return {
          type: AssetType.NATIVE_TOKEN,
          value: typedInfo.value,
        };
      }
    };

    const spliceTxHash = (id: string): string => {
      // transaction id([network]_[recipient]_[txHash]_[checksum?]):
      // ethereum_0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa_0x0d3c7cde981f654a85d2fbbc76e47ed4bfd3641b12fbe34df36a8d98957d994b_0x3f5adae914eefce2
      const words = id.split('_');
      return words[2];
    };

    return transactions.map((tx: GnosisTransaction) => {
      const txInfo = tx.transaction.txInfo as GnosisTransfer;
      return {
        type:
          txInfo.direction === 'INCOMING'
            ? TransactionType.RECEIVED
            : TransactionType.SENT,
        asset: mapToTransferInfo(txInfo.transferInfo),
        from: txInfo.sender.value,
        to: txInfo.recipient.value,
        created: new Date(tx.transaction.timestamp),
        txHash: spliceTxHash(tx.transaction.id),
        status: tx.transaction.txStatus as string as TransactionStatus,
      };
    });
  }

  listProposals(): Promise<ProposalT[]> {
    throw new NotImplementedError();
  }

  getProposal(_: ProposalId): Promise<ProposalT> {
    throw new NotImplementedError();
  }

  protected static async uploadToIPFS(
    signer: ethers.Signer,
    payload: CreateProposalParams
  ): Promise<string> {
    const now = new Date();
    const address = await signer.getAddress();
    const chainId = await signer.getChainId();

    const proposal = JSON.stringify({
      payload: {
        ...payload,
        createdBy: address,
        createdAt: timestamp(now),
        network: chainId,
      },
    });

    const hash = keccak256(toUtf8Bytes(proposal));

    const ipfsHash = await IPFSClient.upload(`zDAO/${hash}`, {
      address: address,
      hash,
      data: {
        types: [
          {
            type: 'address',
            name: 'createdBy',
          },
          {
            type: 'uint256',
            name: 'createdAt',
          },
          {
            type: 'uint256',
            name: 'network',
          },
        ],
        message: {
          ...payload,
          createdBy: address,
          createdAt: timestamp(now),
          network: chainId,
        },
      },
    });

    return ipfsHash;
  }

  createProposal(
    _: ethers.providers.Web3Provider | ethers.Wallet,
    _2: string,
    _3: CreateProposalParams
  ): Promise<ProposalId> {
    throw new NotImplementedError();
  }
}

export default AbstractDAOClient;
