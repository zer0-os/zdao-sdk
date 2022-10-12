import { createInstance as createZNSInstance } from '@zero-tech/zns-sdk';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import {
  developmentConfiguration,
  productionConfiguration,
} from '../../src/config';
import {
  Config,
  ProposalState,
  SDKInstance,
  SupportedChainId,
  zDAO,
  zNA,
} from '../../src/types';
import { setEnv } from '../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const createProposal = async (
  sdkInstance: SDKInstance,
  signer: ethers.Wallet
) => {
  const blockNumber = await signer.provider.getBlockNumber();

  const zDAO = await sdkInstance.createZDAOFromParams({
    ens: 'zdao721test.eth',
    zNA: 'wilder.moto',
    duration: 86400,
    title: 'ERC721 Enumerable DAO',
    creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
    network: SupportedChainId.RINKEBY,
    safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
    votingToken: '0xa4F6C921f914ff7972D7C55c15f015419326e0Ca', // GuildNFT (GGD)
  });

  await zDAO.createProposal(signer, signer.address, {
    title: 'Hello Proposal',
    body: 'Hello World',
    snapshot: blockNumber,
    choices: ['Yes', 'No', 'Absent'],
    transfer: {
      sender: zDAO.safeAddress,
      recipient: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
      token: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
      decimals: 18,
      symbol: 'zToken',
      amount: BigNumber.from(10).pow(18).mul(50).toString(),
    },
  });
  console.log('proposal created');
};

const pagination = async (sdkInstance: SDKInstance) => {
  // isDev should be false

  // const dao = await sdkInstance.createZDAOFromParams({
  //   ens: 'aave.eth',
  //   zNA: 'aave.eth',
  //   title: 'zDAO Testing Space 1',
  //   creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
  //   network: SupportedChainId.MAINNET,
  //   safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
  //   votingToken: '0x514910771af9ca656af840dff83e8264ecf986ca',
  // });

  const dao = await sdkInstance.createZDAOFromParams({
    ens: 'joshupgig.eth',
    zNA: 'joshupgig.eth',
    title: 'zDAO Testing Space 1',
    creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
    network: SupportedChainId.RINKEBY,
    safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
    votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
  });

  const count = 50;
  for (let i = 0; i < 1000; i += count) {
    console.time('listProposals');
    const proposals = await dao.listProposals({
      from: i,
      count,
    });
    console.log('proposals', proposals.length);
    proposals.forEach((proposal) =>
      console.log('proposal.metadata', proposal.id, proposal.metadata)
    );
    console.timeEnd('listProposals');
    if (proposals.length < 1) break;
  }

  const proposal = await dao.getProposal(
    '0xf51d5d3b8f81737a001ea7f8bbb0aa426ff46bfc715e6524bf23271592fabea7'
  );
  console.log('> proposal.metadata', proposal.id, proposal.metadata);

  for (let i = 0; i < 1000; i += count) {
    console.time('listVotes');
    const votes = await proposal.listVotes({
      from: i,
      count,
    });
    console.log('votes', votes.length);
    console.timeEnd('listVotes');
    if (votes.length < 1) break;
  }
};

const immediateVote = async (
  sdkInstance: SDKInstance,
  signer: ethers.Wallet
) => {
  // isDev should be true

  const dao = await sdkInstance.createZDAOFromParams({
    ens: 'zdao-sky.eth',
    zNA: 'zdao-sky.eth',
    title: 'zDAO Testing Space 1',
    creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
    network: SupportedChainId.RINKEBY,
    safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
    votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
  });
  console.log('dao', dao);

  const proposalId =
    '0x558fff7cace5c2f8aa261953e5ad833cfa889ad721051d2557acfda13496f2be';
  const proposal = await dao.getProposal(proposalId);
  await proposal.vote(signer, signer.address, 1);

  const votes = await proposal.listVotes();
  console.log('votes', votes);

  proposal
    .updateScoresAndVotes()
    .then((proposal) =>
      console.log('proposal.scores and votes', proposal.scores, proposal.votes)
    )
    .catch((error) => console.error(error));
};

const immediateVoteAll = async (
  sdkInstance: SDKInstance,
  signer: ethers.Wallet,
  dao: zDAO,
  choice = 1
) => {
  // isDev should be true

  const proposals = await dao.listProposals();
  for (const proposal of proposals) {
    if (proposal.state === ProposalState.ACTIVE) {
      console.log('proposal id', proposal.id, proposal.title);
      const vp = await proposal.getVotingPowerOfUser(signer.address);
      console.log('vp', vp);

      await proposal.vote(signer, signer.address, choice);

      const votes = await proposal.listVotes();
      console.log('votes', votes);
    }
  }
};

const iterateZNAs = async (sdkInstance: SDKInstance) => {
  const zNAs: zNA[] = await sdkInstance.listZNAs();
  console.log('zNAs', zNAs);

  console.time('iterateZNAs');
  // create zdao which is associated with `wilder.cats`
  for (const zNA of zNAs) {
    console.log('> zNA:', zNA);
    const dao: zDAO = await sdkInstance.getZDAOByZNA(zNA);
    console.log(
      'zDAO instance',
      dao.id,
      dao.ens,
      dao.zNAs,
      dao.title,
      dao.votingToken,
      dao.totalSupplyOfVotingToken
    );

    const proposals = await dao.listProposals();
    console.log('proposals', proposals.length);

    // const assets = await dao.listAssets();
    // console.log('assets', assets);

    // const txs = await dao.listTransactions();
    // console.log('transactions', txs);
  }
  console.timeEnd('iterateZNAs');
};

const performance = async (sdkInstance: SDKInstance, signer: ethers.Wallet) => {
  const zNAs: zNA[] = await sdkInstance.listZNAs();
  console.log('zNAs', zNAs);

  const zDAO = await sdkInstance.getZDAOByZNA('wilder.skydao2');
  console.log('zDAO', zDAO);

  const proposals = await zDAO.listProposals();
  console.log('proposals', proposals);
};

const main = async () => {
  const isDev = true;
  const env = setEnv(isDev);

  const provider = new ethers.providers.JsonRpcProvider(
    env.rpcUrl,
    env.network
  );
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const config: Config = isDev
    ? developmentConfiguration(provider, 'zer0.infura-ipfs.io')
    : productionConfiguration(provider, 'zer0.infura-ipfs.io');

  console.time('createSDKInstance');
  const sdkInstance: SDKInstance = createSDKInstance(config);
  console.timeEnd('createSDKInstance');

  console.log('zNS.config', config.zNS);

  const znsInstance = createZNSInstance(config.zNS);

  // await createProposal(sdkInstance, signer);
  // await createToken(sdkInstance, signer);
  // await pagination(sdkInstance);
  // await immediateVote(sdkInstance, signer);
  // await immediateVoteAll(
  //   sdkInstance,
  //   signer,
  //   await sdkInstance.createZDAOFromParams({
  //     ens: 'zdao721test.eth',
  //     zNA: 'wilder.moto',
  //     title: 'ERC721 Enumerable DAO',
  //     creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
  //     network: SupportedChainId.RINKEBY,
  //     safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
  //     votingToken: '0xa4F6C921f914ff7972D7C55c15f015419326e0Ca', // GuildNFT (GGD)
  //   }),
  //   2
  // );
  await iterateZNAs(sdkInstance);
  // await performance(sdkInstance, signer);

  console.log('Finished successfully');
};

main()
  .then(() => console.log('main then'))
  .catch((error) => console.log('main catch', error));
