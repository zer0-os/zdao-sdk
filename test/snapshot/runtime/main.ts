import { ethers } from 'ethers';

import { Snapshot } from '../../../src';
import { ZNAClient } from '../../../src/client';
import { SupportedChainId, zNA } from '../../../src/types';
import { setEnvSnapshot as setEnv } from '../../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const createZDAO = async (
  sdkInstance: Snapshot.SnapshotSDKInstance,
  signer: ethers.Wallet,
  env: any
) => {
  // isDev should be true

  for (const DAO of env.DAOs.rinkeby) {
    for (const zNA of DAO.zNAs) {
      console.log(DAO.name, zNA, ZNAClient.zNATozNAId(zNA));
    }

    if (!(await sdkInstance.doesZDAOExist(DAO.zNAs[0]))) {
      console.log('creating zDAO', DAO);
      const params: Snapshot.CreateSnapshotZDAOParams = {
        zNA: DAO.zNAs[0],
        name: DAO.name,
        network: SupportedChainId.RINKEBY,
        gnosisSafe: DAO.gnosisSafe,
        votingToken: DAO.votingToken,
        minimumVotingTokenAmount: '0',
        votingDuration: DAO.duration ?? 1800,
        ens: DAO.ens,
      };
      await sdkInstance.createZDAO(signer, undefined, params);

      console.log(`DAO ${DAO.zNAs} created`);
    }
  }
};

const pagination = async (sdkInstance: Snapshot.SnapshotSDKInstance) => {
  // isDev should be true

  const dao: Snapshot.SnapshotZDAO = await sdkInstance.getZDAOByZNA(
    'wilder.wheels'
  );

  const count = 50;
  for (let i = 0; i < 1000; i += count) {
    console.time('listProposals');
    const proposals: Snapshot.SnapshotProposal[] = await dao.listProposals({
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

  const proposal: Snapshot.SnapshotProposal = await dao.getProposal(
    '0xf51d5d3b8f81737a001ea7f8bbb0aa426ff46bfc715e6524bf23271592fabea7'
  );
  console.log('> proposal.metadata', proposal.id, proposal.metadata);

  for (let i = 0; i < 1000; i += count) {
    console.time('listVotes');
    const votes: Snapshot.SnapshotVote[] = await proposal.listVotes({
      from: i,
      count,
    });
    console.log('votes', votes.length);
    console.timeEnd('listVotes');
    if (votes.length < 1) break;
  }
};

const immediateVote = async (
  sdkInstance: Snapshot.SnapshotSDKInstance,
  signer: ethers.Wallet
) => {
  // isDev should be true

  const dao: Snapshot.SnapshotZDAO = await sdkInstance.getZDAOByZNA(
    'joshupgig.eth'
  );

  const proposalId =
    '0xf21ff6d023ead5cddb4937c9a00435d5468cd4c4aed6466a455b8342f4842dc6';
  const proposal: Snapshot.SnapshotProposal = await dao.getProposal(proposalId);
  await proposal.vote(signer, undefined, {
    choice: 2,
  });

  const votes: Snapshot.SnapshotVote[] = await proposal.listVotes();
  console.log('votes', votes);

  const proposal1: Snapshot.SnapshotProposal = await dao.getProposal(
    proposalId
  );
  console.log('proposal.scores', proposal1.scores);
};

const iterateZNAs = async (sdkInstance: Snapshot.SnapshotSDKInstance) => {
  const zNAs: zNA[] = await sdkInstance.listZNAs();
  console.log('zNAs', zNAs);

  // create zdao which is associated with `wilder.cats`
  for (const zNA of zNAs) {
    console.log('> zNA:', zNA);
    const dao = await sdkInstance.getZDAOByZNA(zNA);
    console.log('zDAO instance', dao);

    const proposals: Snapshot.SnapshotProposal[] = await dao.listProposals();
    console.log('proposals', proposals.length);

    const assets = await dao.listAssets();
    console.log('assets', assets);

    const txs = await dao.listTransactions();
    console.log('transactions', txs);
  }
};

const performance = async (sdkInstance: Snapshot.SnapshotSDKInstance) => {
  for (let i = 0; i < 10; i++) {
    console.time('getZDAOByZNA');
    await sdkInstance.getZDAOByZNA('wilder.cats');
    console.timeEnd('getZDAOByZNA');
  }
};

const main = async () => {
  const isDev = true;
  const env = setEnv();

  const provider = new ethers.providers.JsonRpcProvider(
    isDev ? env.rpc.rinkeby : env.rpc.mainnet,
    isDev ? SupportedChainId.RINKEBY : SupportedChainId.MAINNET
  );
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const config = isDev
    ? Snapshot.developmentConfiguration({
        ethereumProvider: provider,
        fleek: env.fleek,
        ipfsGateway: 'zer0.infura-ipfs.io',
      })
    : Snapshot.productionConfiguration({
        ethereumProvider: provider,
        fleek: env.fleek,
        ipfsGateway: 'zer0.infura-ipfs.io',
      });

  const sdkInstance: Snapshot.SnapshotSDKInstance =
    await Snapshot.createSDKInstance(config);

  // await createZDAO(sdkInstance, signer, env);
  // await createToken(sdkInstance, signer);
  // await pagination(sdkInstance);
  // await immediateVote(sdkInstance, signer);
  // await iterateZNAs(sdkInstance);

  // await performance(sdkInstance);

  console.log('Finished successfully');
};

main()
  .then(() => console.log('main then'))
  .catch((error) => console.log('main catch', error));
