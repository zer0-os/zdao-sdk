import Safe from '@gnosis.pm/safe-core-sdk';
import { SafeEthersSigner, SafeService } from '@gnosis.pm/safe-ethers-adapters';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import {
  developmentConfiguration,
  productionConfiguration,
} from '../../src/config';
import {
  Config,
  GnosisSafeConfig,
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

  // const zDAO = await sdkInstance.createZDAOFromParams({
  //   ens: 'zdao721test.eth',
  //   zNA: 'wilder.moto',
  //   duration: 86400,
  //   title: 'ERC721 Enumerable DAO',
  //   creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
  //   network: SupportedChainId.RINKEBY,
  //   safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
  //   votingToken: '0xa4F6C921f914ff7972D7C55c15f015419326e0Ca', // GuildNFT (GGD)
  // });

  const zDAO = await sdkInstance.getZDAOByZNA('wilder.moto');

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

const iterateZNAs = async (
  sdkInstance: SDKInstance,
  gnosisSigner: ethers.Wallet
) => {
  console.time('listZNAs');
  const zNAs: zNA[] = await sdkInstance.listZNAs();
  console.timeEnd('listZNAs');
  console.log('zNAs', zNAs);

  console.time('iterateZNAs');
  // create zdao which is associated with `wilder.cats`
  for (const zNA of zNAs) {
    console.log('> zNA:', zNA);
    console.time('getZDAOByZNA');
    const dao: zDAO = await sdkInstance.getZDAOByZNA(zNA);
    console.timeEnd('getZDAOByZNA');
    console.log(
      'zDAO instance',
      dao.id,
      dao.ens,
      dao.zNAs,
      dao.title,
      dao.votingToken,
      dao.totalSupplyOfVotingToken
    );

    console.time('listProposals');
    const proposals = await dao.listProposals();
    console.timeEnd('listProposals');
    console.log('proposals', proposals.length);

    console.time('listAssets');
    const assets = await dao.listAssets();
    console.timeEnd('listAssets');
    // console.log('assets', assets);

    console.time('listTransactions');
    const txs = await dao.listTransactions();
    console.timeEnd('listTransactions');
    // console.log('transactions', txs);
  }
  console.timeEnd('iterateZNAs');
};

const performance = async (sdkInstance: SDKInstance, signer: ethers.Wallet) => {
  console.time('listZNAs');
  const zNAs: zNA[] = await sdkInstance.listZNAs();
  console.timeEnd('listZNAs');
  console.log('zNAs', zNAs);

  console.time('Promise.getZDAOByZNA');
  const daos: zDAO[] = await Promise.all(
    zNAs.map((zna) => sdkInstance.getZDAOByZNA(zna))
  );
  console.timeEnd('Promise.getZDAOByZNA');
  console.log('zDAOs', daos.length);

  console.time('Promise,listAssetsCoins');
  await Promise.all(daos.map((dao) => dao.listAssetsCoins()));
  console.timeEnd('Promise,listAssetsCoins');

  console.time('Promise,listAssetsCollectibles');
  await Promise.all(daos.map((dao) => dao.listAssetsCollectibles()));
  console.timeEnd('Promise,listAssetsCollectibles');

  console.time('Promise,listAssets');
  await Promise.all(daos.map((dao) => dao.listAssets()));
  console.timeEnd('Promise,listAssets');

  console.time('Promise,listTransactions');
  await Promise.all(daos.map((dao) => dao.listTransactions()));
  console.timeEnd('Promise,listTransactions');
};

const testZDAO = async (sdkInstance: SDKInstance) => {
  const zDAO = await sdkInstance.getZDAOByZNA('wilder.wheels');
  // const coins = await zDAO.listAssetsCoins();
  // console.log('coins', coins);
  const collectibles = await zDAO.listAssetsCollectibles();
  console.log('collectibles', collectibles.length);
};

const multiSignTransaction = async (
  config: GnosisSafeConfig,
  safeAddress: string,
  gnosisSafeSigner: ethers.Wallet
) => {
  const ethAdapter = new EthersAdapter({
    ethers,
    signer: gnosisSafeSigner,
  });
  const safeService = new SafeService(config.serviceUri);
  const safe = await Safe.create({
    ethAdapter,
    safeAddress,
  });
  const safeSigner = new SafeEthersSigner(
    safe,
    safeService,
    gnosisSafeSigner.provider
  );

  const abi = [
    {
      inputs: [{ internalType: 'address', name: 'module', type: 'address' }],
      name: 'enableModule',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const module = '0x97199c4d45037c1D12F24048Ea8a19A564A4b661';

  const gnosisProxyInterface = new ethers.utils.Interface(abi);
  const txData = gnosisProxyInterface.encodeFunctionData('enableModule', [
    module,
  ]);
  console.log('txdata', txData);
  const resp = await safeSigner.sendTransaction({
    value: '0',
    to: safeAddress,
    data: txData,
  });
  console.log('resp', resp);
};

const main = async () => {
  const isDev = false;
  const env = setEnv(isDev);

  const provider = new ethers.providers.JsonRpcProvider(
    env.rpcUrl,
    env.network
  );
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const gnosisSigner = new ethers.Wallet(
    process.env.GNOSIS_OWNER_PRIVATE_KEY!,
    provider
  );

  const config: Config = isDev
    ? developmentConfiguration(provider, 'snapshot.mypinata.cloud')
    : productionConfiguration(provider, 'snapshot.mypinata.cloud');

  console.time('createSDKInstance');
  const sdkInstance: SDKInstance = createSDKInstance(config);
  console.timeEnd('createSDKInstance');

  // console.log('zNS.config', config.zNS);
  // const znsInstance = createZNSInstance(config.zNS);
  // console.log('wilder.moto', zns.domains.domainNameToId('wilder.moto'));
  // console.log('wilder.skydao', zns.domains.domainNameToId('wilder.skydao'));
  // console.log('wilder.moto', zns.domains.domainNameToId('wilder.moto'));

  // console.log(
  //   '0x617b3c878abfceb89eb62b7a24f393569c822946bbc9175c6c65a7d2647c5402',
  //   await znsInstance
  //     .getDomainById(
  //       '0x617b3c878abfceb89eb62b7a24f393569c822946bbc9175c6c65a7d2647c5402'
  //     )
  //     .then((domain) => domain.name)
  // );
  // console.log(
  //   '0x81a205879073b617f10e379fbb3558ac869fe9f182b029307f9e216d736dc3f4',
  //   await znsInstance
  //     .getDomainById(
  //       '0x81a205879073b617f10e379fbb3558ac869fe9f182b029307f9e216d736dc3f4'
  //     )
  //     .then((domain) => domain.name)
  // );
  // console.log(
  //   '0x45483a3a19b4ce3eb27a6d8e0b4d1eb6561c94af65b268fc1038d45130e65796',
  //   await znsInstance
  //     .getDomainById(
  //       '0x45483a3a19b4ce3eb27a6d8e0b4d1eb6561c94af65b268fc1038d45130e65796'
  //     )
  //     .then((domain) => domain.name)
  // );

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
  // await iterateZNAs(sdkInstance, gnosisSigner);
  await performance(sdkInstance, signer);
  // await testZDAO(sdkInstance);

  // const gnosisSafeClient = new GnosisSafeClient(config.gnosisSafe);
  // await gnosisSafeClient.proposeTxFromModule(
  //   '0x7a935d07d097146f143A45aA79FD8624353abD5D',
  //   gnosisSigner,
  //   'executeProposal',
  //   [
  //     PlatformType.Snapshot.toString(),
  //     ethers.utils.keccak256(
  //       ethers.utils.defaultAbiCoder.encode(['string'], ['Hello World1'])
  //     ),
  //     '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
  //     '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b',
  //     '1000000000000000000000',
  //   ]
  // );
  // const executed = await gnosisSafeClient.isProposalsExecuted(
  //   PlatformType.Snapshot,
  //   ['hddld', 'Hello World', 'HelloWorld']
  // );
  // console.log('executed', executed);

  // await multiSignTransaction(
  //   config.gnosisSafe,
  //   '0x7a935d07d097146f143A45aA79FD8624353abD5D',
  //   gnosisSigner
  // );

  console.log('Finished successfully');
};

main()
  .then(() => console.log('main then'))
  .catch((error) => console.log('main catch', error));
