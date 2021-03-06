import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import {
  developmentConfiguration,
  productionConfiguration,
} from '../../src/config';
import {
  Config,
  SDKInstance,
  SupportedChainId,
  zDAO,
  zNA,
} from '../../src/types';
import { setEnv } from '../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const createToken = async (sdkInstance: SDKInstance, signer: ethers.Wallet) => {
  // isDev should be true

  const token = await sdkInstance.createZToken(signer, 'zSample', 'ZSAMPLE', {
    target: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
    amount: BigNumber.from(10).pow(18).mul(10000).toString(),
  });
  console.log('new token', token);
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

const main = async () => {
  const isDev = true;
  const env = setEnv(isDev);

  const provider = new ethers.providers.JsonRpcProvider(
    env.rpcUrl,
    env.network
  );
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const config: Config = isDev
    ? developmentConfiguration(
        env.zDAORegistry,
        provider,
        'snapshot.mypinata.cloud'
      )
    : productionConfiguration(
        env.zDAORegistry,
        provider,
        'snapshot.mypinata.cloud'
      );

  const sdkInstance: SDKInstance = createSDKInstance(config);

  // await createToken(sdkInstance, signer);
  // await pagination(sdkInstance);
  // await immediateVote(sdkInstance, signer);

  const zNAs: zNA[] = await sdkInstance.listZNAs();
  console.log('zNAs', zNAs);

  // create zdao which is associated with `wilder.cats`
  for (const zNA of zNAs) {
    console.log('> zNA:', zNA);
    const dao: zDAO = await sdkInstance.getZDAOByZNA(zNA);
    console.log('zDAO instance', dao);

    const proposals = await dao.listProposals();
    console.log('proposals', proposals);

    const assets = await dao.listAssets();
    console.log('assets', assets);

    const txs = await dao.listTransactions();
    console.log('transactions', txs);
  }
  console.log('Finished successfully');
};

main()
  .then(() => console.log('main then'))
  .catch((error) => console.log('main catch', error));
