import { TransactionResponse } from '@ethersproject/abstract-provider';
import { ethers } from 'ethers';
import shortid from 'shortid';

import { createClient as createGnosisSafeClient } from './gnosis-safe';
import { Transaction } from './gnosis-safe/types';
import { createClient as createSnapshotClient } from './snapshot-io';
import {
  Proposal,
  ProposalDetails,
  ProposalResult,
  Vote,
} from './snapshot-io/types';
import {
  Config,
  CreateProposalParams,
  CreateZDAOParams,
  ExecuteProposalParams,
  SDKInstance,
  VoteProposalParams,
  zDAO,
  zDAOAssets,
  ZDAOInstance,
  zNA,
} from './types';
import { fetchIpfs } from './utilities/ipfs';
import { t } from './utilities/messages';
import { createClient as createZNAClient } from './zNA';

export * from './config';
export * from './gnosis-safe/types';
export * from './snapshot-io/types';
export * from './types';

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

  const listZDAOs = async (): Promise<zNA[]> => {
    const zNAs: zNA[] = await naming.listZDAOs();
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

  const createZDAOFromParams = async (
    param: CreateZDAOParams
  ): Promise<void> => {
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
    listZDAOs,
    getZDAOByZNA,
    doesZDAOExist,
    createZDAOFromParams,
  };
};

const createZDAOInstance = (config: Config, dao: zDAO): ZDAOInstance => {
  const snapshot = createSnapshotClient(config.snapshot, dao);
  const gnosisSafe = createGnosisSafeClient(config.gnosisSafe, dao);

  const instance: ZDAOInstance = {
    getDetails: (): zDAO => {
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

    getProposalDetails: async (
      proposalId: string
    ): Promise<ProposalDetails> => {
      return await snapshot.getProposalDetails(proposalId);
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
      proposal: ProposalDetails,
      votes: Vote[]
    ): Promise<ProposalResult> => {
      return await snapshot.getProposalResults(proposal, votes);
    },

    getVotingPower: async (
      account: string,
      proposal: ProposalDetails
    ): Promise<number> => {
      return await snapshot.getVotingPower(account, proposal);
    },

    createProposal: async (
      signer: ethers.Wallet,
      payload: CreateProposalParams
    ): Promise<string> => {
      return await snapshot.createProposal(signer, payload);
    },

    voteProposal: async (
      signer: ethers.Wallet,
      payload: VoteProposalParams
    ): Promise<string> => {
      return await snapshot.voteProposal(signer, payload);
    },

    executeProposal: async (
      signer: ethers.Wallet,
      payload: ExecuteProposalParams
    ): Promise<TransactionResponse> => {
      const isOwner = await gnosisSafe.isOwnerAddress(signer, signer.address);
      if (!isOwner) {
        throw Error(t('not-gnosis-owner'));
      }

      const proposalDetails: ProposalDetails =
        await snapshot.getProposalDetails(payload.proposal);

      if (!proposalDetails.metadata) {
        throw Error(t('empty-metadata'));
      }

      if (
        !proposalDetails.metadata?.token ||
        proposalDetails.metadata.token.length < 1
      ) {
        // Ether transfer
        return await gnosisSafe.transferEther(
          signer,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          proposalDetails.metadata!.recipient,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          proposalDetails.metadata!.amount.toString()
        );
      } else {
        // ERC20 transfer
        return await gnosisSafe.transferERC20(
          signer,
          proposalDetails.metadata.token,
          proposalDetails.metadata.recipient,
          proposalDetails.metadata.amount.toString()
        );
      }
    },
  };
  return instance;
};
