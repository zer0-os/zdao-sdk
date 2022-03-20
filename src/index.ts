import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ethers } from 'ethers';
import shortid from 'shortid';

import { createClient as createGnosisSafeClient } from './gnosis-safe';
import { Transaction } from './gnosis-safe/types';
import { createClient as createSnapshotClient } from './snapshot-io';
import {
  Proposal,
  ProposalDetail,
  ProposalResult,
  Vote,
  zDAO,
} from './snapshot-io/types';
import {
  Config,
  CreateProposalDto,
  CreateZDAODto,
  ExecuteProposalDto,
  SDKInstance,
  VoteProposalDto,
  zDAOAssets,
  ZDAOInstance,
  zNA,
} from './types';
import { fetchIpfs } from './utilities/ipfs';
import { t } from './utilities/messages';
import { createClient as createZNAClient } from './zNA';

export const createSDKInstance = (config: Config): SDKInstance => {
  // let spaces: Space[] | undefined = undefined;
  const daos: zDAO[] = [];

  const naming = createZNAClient(config.zNA);

  // const initialize = async (): Promise<Space[]> => {
  //   if (spaces) {
  //     return spaces;
  //   }
  //   const { chainId } = await config.zNA.provider.getNetwork();
  //   spaces = await listSpaces(config.snapshot, chainId.toString());
  //   return spaces;
  // };

  const listZNA = async (): Promise<zNA[]> => {
    const zNAs: zNA[] = await naming.listZNA();
    const merged = zNAs.concat(...daos.map((dao: zDAO) => dao.zNA));
    return merged.filter((c, index) => merged.indexOf(c) === index);
  };

  const getZDAOByZNA = async (zNA: zNA): Promise<ZDAOInstance> => {
    // find zDAO from already registered zDAO list
    const found = daos.find((dao: zDAO) => dao.zNA === zNA);
    if (found) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return createZDAOInstance(config, found!);
    }

    // get zDAO id from contract
    const daoId = await naming.getZDAOIdByZNA(zNA);
    if (!daoId) {
      throw Error(t('not-found-zdao'));
    }

    // get zDAO meta data from contract
    const metaUri = await naming.getDAOMetadataUri(daoId);
    // parse ipfs json and compose zDAO structure
    const ipfsData = await fetchIpfs(config.snapshot.ipfsGateway, metaUri);
    const dao = {
      id: daoId,
      zNA,
      title: ipfsData.title,
      creator: ipfsData.creator,
      owners: ipfsData.owners,
      avatar: ipfsData.avatar,
      network: ipfsData.network,
      safeAddress: ipfsData.safeAddress,
      votingToken: ipfsData.votingToken,
    };
    return createZDAOInstance(config, dao);
  };

  const doesZDAOExist = async (zNA: zNA): Promise<boolean> => {
    const found = daos.find((dao: zDAO) => dao.zNA === zNA);
    if (!found) {
      return await naming.doesZDAOExist(zNA);
    }
    return true;
  };

  const createZDAOFromParams = async (param: CreateZDAODto): Promise<void> => {
    if (await doesZDAOExist(param.zNA)) {
      throw Error(t('already-exist-zdao'));
    }
    if (param.title.length < 1) {
      throw Error('empty-zdao-title');
    }
    if (param.safeAddress.length < 1) {
      throw Error('empty-gnosis-address');
    }
    if (param.owners.length < 1) {
      throw Error(t('empty-gnosis-owners'));
    }
    if (param.votingToken.length < 1) {
      throw Error(t('empty-voting-token'));
    }

    daos.push({
      id: shortid.generate(),
      zNA: param.zNA,
      title: param.title,
      creator: param.creator,
      avatar: param.avatar,
      network: param.network.toString(),
      safeAddress: param.safeAddress,
      owners: param.owners,
      votingToken: param.votingToken,
    });
  };

  return {
    listZNA,
    getZDAOByZNA,
    doesZDAOExist,
    createZDAOFromParams,
  };
};

const createZDAOInstance = (config: Config, dao: zDAO): ZDAOInstance => {
  const snapshot = createSnapshotClient(config.snapshot, dao);
  const gnosisSafe = createGnosisSafeClient(config.gnosisSafe, dao);

  const instance: ZDAOInstance = {
    getZDAO: (): zDAO => {
      return dao;
    },

    listAssets: async (): Promise<zDAOAssets> => {
      return await gnosisSafe.listAssets();
    },

    listTransactions: async (): Promise<Transaction[]> => {
      return await gnosisSafe.listTransactions();
    },

    listProposals: async (from: number, count: number): Promise<Proposal[]> => {
      return await snapshot.listProposals(from, count);
    },

    getProposalDetail: async (proposalId: string): Promise<ProposalDetail> => {
      return await snapshot.getProposalDetail(proposalId);
    },

    getProposalVotes: async (
      proposalId: string,
      from: number,
      count: number,
      voter: string
    ): Promise<Vote[]> => {
      return await snapshot.getProposalVotes(proposalId, from, count, voter);
    },

    getProposalResults: async (
      proposal: ProposalDetail,
      votes: Vote[]
    ): Promise<ProposalResult> => {
      return await snapshot.getProposalResults(proposal, votes);
    },

    getVotingPower: async (
      account: string,
      proposal: ProposalDetail
    ): Promise<number> => {
      return await snapshot.getVotingPower(account, proposal);
    },

    createProposal: async (
      signer: ethers.Wallet,
      payload: CreateProposalDto
    ): Promise<string> => {
      return await snapshot.createProposal(signer, payload);
    },

    voteProposal: async (
      signer: ethers.Wallet,
      payload: VoteProposalDto
    ): Promise<string> => {
      return await snapshot.voteProposal(signer, payload);
    },

    executeProposal: async (
      signer: ethers.Wallet,
      payload: ExecuteProposalDto
    ): Promise<TransactionResponse> => {
      const isOwner = await gnosisSafe.isOwnerAddress(signer, signer.address);
      if (!isOwner) {
        throw Error(t('not-gnosis-owner'));
      }

      const proposalDetail: ProposalDetail = await snapshot.getProposalDetail(
        payload.proposal
      );

      if (!proposalDetail.metadata) {
        throw Error(t('empty-metadata'));
      }

      if (
        !proposalDetail.metadata?.token ||
        proposalDetail.metadata.token.length < 1
      ) {
        // Ether transfer
        return await gnosisSafe.transferEther(
          signer,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          proposalDetail.metadata!.recipient,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          proposalDetail.metadata!.amount.toString()
        );
      } else {
        // ERC20 transfer
        return await gnosisSafe.transferERC20(
          signer,
          proposalDetail.metadata.token,
          proposalDetail.metadata.recipient,
          proposalDetail.metadata.amount.toString()
        );
      }
    },
  };
  return instance;
};
