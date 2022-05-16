import {
  Erc20Transfer as GnosisErc20Transfer,
  Erc721Transfer as GnosisErc721Transfer,
  NativeCoinTransfer as GnosisNativeCoinTransfer,
  Transaction as GnosisTransaction,
  Transfer as GnosisTransfer,
  TransferInfo as GnosisTransferInfo,
} from '@gnosis.pm/safe-react-gateway-sdk';
import { ethers, Signer } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { cloneDeep } from 'lodash';

import { EIP712Domain } from '../config';
import { GnosisSafeClient } from '../gnosis-safe';
import {
  AssetType,
  CreateProposalParams,
  Proposal,
  ProposalId,
  Transaction,
  TransactionStatus,
  TransactionType,
  TransferInfo,
  VoteChoice,
  zDAO,
  zDAOAssets,
  zDAOProperties,
} from '../types';
import { NotImplementedError } from '../types/error';
import { timestamp } from '../utilities/tx';
import IPFSClient from './IPFSClient';

class AbstractDAOClient implements zDAO {
  protected readonly _properties: zDAOProperties;
  protected _gnosisSafeClient!: GnosisSafeClient;

  constructor(properties: zDAOProperties, gnosisSafeClient: GnosisSafeClient) {
    this._properties = cloneDeep(properties);
    this._gnosisSafeClient = gnosisSafeClient;
  }

  get gnosisSafeClient() {
    return this._gnosisSafeClient;
  }

  get id() {
    return this._properties.id;
  }

  get zNAs() {
    return this._properties.zNAs;
  }

  get title() {
    return this._properties.title;
  }

  get createdBy() {
    return this._properties.createdBy;
  }

  get network() {
    return this._properties.network;
  }

  get gnosisSafe() {
    return this._properties.gnosisSafe;
  }

  get token() {
    return this._properties.token;
  }

  get amount() {
    return this._properties.amount;
  }

  get duration() {
    return this._properties.duration;
  }

  get votingThreshold() {
    return this._properties.votingThreshold;
  }

  get minimumVotingParticipants() {
    return this._properties.minimumVotingParticipants;
  }

  get minimumTotalVotingTokens() {
    return this._properties.minimumTotalVotingTokens;
  }

  get snapshot() {
    return this._properties.snapshot;
  }

  get isRelativeMajority() {
    return this._properties.isRelativeMajority;
  }

  get destroyed() {
    return this._properties.destroyed;
  }

  async listAssets(): Promise<zDAOAssets> {
    const balances = await this._gnosisSafeClient.listAssets(
      this.gnosisSafe,
      this.network.toString()
    );

    const collectibles = await this._gnosisSafeClient.listCollectibles(
      this.gnosisSafe,
      this.network.toString()
    );

    return {
      amountInUSD: Number(balances.fiatTotal),
      coins: balances.items.map((item: any) => ({
        type: item.tokenInfo.type as string as AssetType,
        address: item.tokenInfo.address,
        decimals: item.tokenInfo.decimals,
        symbol: item.tokenInfo.symbol,
        name: item.tokenInfo.name,
        logoUri: item.tokenInfo.logoUri ?? undefined,
        amount: item.balance,
        amountInUSD: Number(item.fiatBalance),
      })),
      collectibles: collectibles.map((item: any) => ({
        address: item.address,
        tokenName: item.tokenName,
        tokenSymbol: item.tokenSymbol,
        id: item.id,
        logoUri: item.logoUri,
        name: item.name,
        description: item.description,
        imageUri: item.imageUri,
        metadata: item.metadata,
      })),
    };
  }

  async listTransactions(): Promise<Transaction[]> {
    const transactions: GnosisTransaction[] =
      await this._gnosisSafeClient.listTransactions(
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
        status: tx.transaction.txStatus as string as TransactionStatus,
      };
    });
  }

  listProposals(): Promise<Proposal[]> {
    throw new NotImplementedError();
  }

  getProposal(_: ProposalId): Promise<Proposal> {
    throw new NotImplementedError();
  }

  protected async uploadToIPFS(
    signer: Signer,
    payload: CreateProposalParams
  ): Promise<string> {
    const now = new Date();
    const address = await signer.getAddress();
    const chainId = await signer.getChainId();

    const proposal = JSON.stringify({
      domain: EIP712Domain,
      payload: {
        createdBy: address,
        createdAt: timestamp(now),
        title: payload.title,
        body: payload.body,
        choices: [VoteChoice.YES, VoteChoice.NO],
        network: chainId,
        metadata: JSON.stringify(payload.transfer),
      },
    });

    const hash = keccak256(toUtf8Bytes(proposal));

    const ipfsHash = await IPFSClient.upload(`zDAO/${hash}`, {
      address: address,
      hash,
      data: {
        domain: EIP712Domain,
        types: [
          {
            type: 'address',
            name: 'signer',
          },
          {
            type: 'uint256',
            name: 'timestamp',
          },
          {
            type: 'string',
            name: 'title',
          },
          {
            type: 'string',
            name: 'body',
          },
          {
            type: 'address',
            name: 'target',
          },
          {
            type: 'uint256',
            name: 'value',
          },
          {
            type: 'bytes',
            name: 'data',
          },
        ],
        message: {
          createdBy: address,
          createdAt: timestamp(now),
          title: payload.title,
          body: payload.body,
          choices: [VoteChoice.YES, VoteChoice.NO],
          network: chainId,
          metadata: JSON.stringify(payload.transfer),
        },
      },
    });

    return ipfsHash;
  }

  createProposal(_: Signer, _2: CreateProposalParams): Promise<Proposal> {
    throw new NotImplementedError();
  }

  isCheckPointed(_: string): Promise<boolean> {
    throw new NotImplementedError();
  }

  syncState(_: Signer, _2: string): Promise<ethers.ContractReceipt> {
    throw new NotImplementedError();
  }
}

export default AbstractDAOClient;
