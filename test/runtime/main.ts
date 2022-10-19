import { createInstance as createZNSInstance } from '@zero-tech/zns-sdk';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import {
  developmentConfiguration,
  productionConfiguration,
} from '../../src/config';
import {
  Choice,
  Config,
  ProposalId,
  SDKInstance,
  SupportedChainId,
  zDAO,
  zNA,
} from '../../src/types';
import { setEnv } from '../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const createProposal = async (
  sdkInstance: SDKInstance,
  signer: ethers.Wallet,
  zDAO: zDAO
) => {
  const blockNumber = await signer.provider.getBlockNumber();

  await zDAO.createProposal(signer, signer.address, {
    title: 'Hello Proposal',
    body: 'Hello World',
    snapshot: blockNumber,
    choices: ['Yes', 'No', 'Absent'],
    transfer: {
      sender: zDAO.safeAddress,
      recipient: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
      token: '0x009A11617dF427319210e842D6B202f3831e0116',
      decimals: 0,
      symbol: 'zNS',
      amount: BigNumber.from(10).pow(18).toString(),
    },
  });
  console.log('proposal created');
};

const pagination = async (sdkInstance: SDKInstance, zDAO: zDAO) => {
  let proposalId = '',
    maxVoters = -1;

  const count = 50;

  for (let i = 0; i < 1000; i += count) {
    console.time('listProposals');
    const proposals = await zDAO.listProposals({
      from: i,
      count,
    });
    console.log('proposals', proposals.length);
    proposals.forEach((proposal) => {
      console.log('proposal.metadata', proposal.id, proposal.metadata);
      if (proposal.votes > maxVoters) {
        maxVoters = proposal.votes;
        proposalId = proposal.id;
      }
    });
    console.timeEnd('listProposals');
    if (proposals.length < 1) break;
  }

  if (proposalId.length < 1) return;

  const proposal = await zDAO.getProposal(proposalId);
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
  signer: ethers.Wallet,
  zDAO: zDAO,
  proposalId: ProposalId,
  choice: Choice
) => {
  // isDev should be true

  const proposal = await zDAO.getProposal(proposalId);
  await proposal.vote(signer, signer.address, choice);

  const votes = await proposal.listVotes();
  console.log('votes', votes);

  proposal
    .updateScoresAndVotes()
    .then((proposal) =>
      console.log('proposal.scores and votes', proposal.scores, proposal.votes)
    )
    .catch((error) => console.error(error));
};

const iterateZNAs = async (sdkInstance: SDKInstance) => {
  const zNAs: zNA[] = await sdkInstance.listZNAs();
  console.log('zNAs', zNAs);

  console.time('iterateZNAs');
  // create zdao which is associated with `wilder.cats`
  for (const zNA of zNAs) {
    console.log('> zNA:', zNA);
    const zDAO: zDAO = await sdkInstance.getZDAOByZNA(zNA);
    console.log(
      'zDAO instance',
      zDAO.id,
      zDAO.ens,
      zDAO.zNAs,
      zDAO.title,
      zDAO.safeAddress,
      zDAO.votingToken,
      zDAO.duration,
      zDAO.totalSupplyOfVotingToken
    );

    const proposals = await zDAO.listProposals();
    console.log('proposals', proposals.length);

    const assets = await zDAO.listAssets();
    console.log('assets', assets);

    const txs = await zDAO.listTransactions();
    console.log('transactions', txs);
  }
  console.timeEnd('iterateZNAs');
};

const main = async () => {
  const isDev = true;
  const env = setEnv(isDev);

  const provider = new ethers.providers.JsonRpcProvider(
    env.rpcUrl,
    env.network
  );
  const signer = new ethers.Wallet(env.privateKey, provider);

  const config: Config = isDev
    ? developmentConfiguration(provider, 'zer0.infura-ipfs.io')
    : productionConfiguration(provider, 'zer0.infura-ipfs.io');

  console.time('createSDKInstance');
  const sdkInstance: SDKInstance = createSDKInstance(config);
  console.timeEnd('createSDKInstance');

  const znsInstance = createZNSInstance(config.zNS);

  for (const DAO of env.DAOs) {
    const zDAO = await sdkInstance.createZDAOFromParams({
      ens: DAO.ens,
      zNA: DAO.zNAs[0],
      duration: DAO.duration,
      title: DAO.title,
      creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
      network: SupportedChainId.GOERLI,
      safeAddress: DAO.safeAddress,
      votingToken: DAO.votingToken,
    });

    console.log(
      'zDAO instance',
      zDAO.id,
      zDAO.ens,
      zDAO.zNAs,
      zDAO.title,
      zDAO.safeAddress,
      zDAO.votingToken,
      zDAO.duration,
      zDAO.totalSupplyOfVotingToken
    );

    await createProposal(sdkInstance, signer, zDAO);
    await pagination(sdkInstance, zDAO);
    // await immediateVote(
    //   sdkInstance,
    //   signer,
    //   zDAO,
    //   '0xf51d5d3b8f81737a001ea7f8bbb0aa426ff46bfc715e6524bf23271592fabea7',
    //   1
    // );
  }
  await iterateZNAs(sdkInstance);

  console.log('Finished successfully');
};

main()
  .then(() => console.log('main then'))
  .catch((error) => console.log('main catch', error));
