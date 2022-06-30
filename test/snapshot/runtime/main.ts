import { ethers } from 'ethers';

import { Snapshot } from '../../../src';
import { SupportedChainId, zNA } from '../../../src/types';
import { setEnvSnapshot as setEnv } from '../../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const createZDAO = async (
  sdkInstance: Snapshot.SDKInstance,
  signer: ethers.Wallet,
  env: any
) => {
  // isDev should be true

  for (const DAO of env.DAOs.rinkeby) {
    if (await sdkInstance.doesZDAOExist(DAO.ens as zNA)) continue;

    console.log('creating zDAO', DAO);
    const params: Snapshot.CreateZDAOParams = {
      zNA: DAO.ens,
      name: DAO.name,
      network: SupportedChainId.RINKEBY,
      gnosisSafe: DAO.gnosisSafe,
      token: DAO.votingToken,
      amount: '0',
      duration: DAO.duration ?? 1800,
      ens: DAO.ens,
    };
    await sdkInstance.createZDAO(signer, undefined, params);
  }
};

const pagination = async (sdkInstance: Snapshot.SDKInstance) => {
  // isDev should be true

  const dao: Snapshot.zDAO = await sdkInstance.getZDAOByZNA('joshupgig.eth');

  const count = 50;
  for (let i = 0; i < 1000; i += count) {
    console.time('listProposals');
    const proposals: Snapshot.Proposal[] = await dao.listProposals({
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

  const proposal: Snapshot.Proposal = await dao.getProposal(
    '0xf51d5d3b8f81737a001ea7f8bbb0aa426ff46bfc715e6524bf23271592fabea7'
  );
  console.log('> proposal.metadata', proposal.id, proposal.metadata);

  for (let i = 0; i < 1000; i += count) {
    console.time('listVotes');
    const votes: Snapshot.Vote[] = await proposal.listVotes({
      from: i,
      count,
    });
    console.log('votes', votes.length);
    console.timeEnd('listVotes');
    if (votes.length < 1) break;
  }
};

const immediateVote = async (
  sdkInstance: Snapshot.SDKInstance,
  signer: ethers.Wallet
) => {
  // isDev should be true

  const dao: Snapshot.zDAO = await sdkInstance.getZDAOByZNA('joshupgig.eth');

  const proposalId =
    '0xf21ff6d023ead5cddb4937c9a00435d5468cd4c4aed6466a455b8342f4842dc6';
  const proposal: Snapshot.Proposal = await dao.getProposal(proposalId);
  await proposal.vote(signer, undefined, {
    choice: 2,
  });

  const votes: Snapshot.Vote[] = await proposal.listVotes();
  console.log('votes', votes);

  const proposal1: Snapshot.Proposal = await dao.getProposal(proposalId);
  console.log('proposal.scores', proposal1.scores);
};

const main = async () => {
  const isDev = true;
  const env = setEnv();

  const signer = new ethers.Wallet(
    process.env.PRIVATE_KEY!,
    new ethers.providers.JsonRpcProvider(
      isDev ? env.rpc.rinkeby : env.rpc.mainnet,
      isDev ? SupportedChainId.RINKEBY : SupportedChainId.MAINNET
    )
  );

  const config = isDev
    ? Snapshot.developmentConfiguration({
        ethereum: {
          zDAOChef: env.contract.zDAOChef.rinkeby,
          rpcUrl: env.rpc.rinkeby,
          network: SupportedChainId.RINKEBY,
          blockNumber: env.contract.zDAOChef.rinkebyBlock,
        },
        zNA: {
          zDAORegistry: env.contract.zDAORegistry.rinkeby,
          zNSHub: env.contract.zNSHub.rinkeby,
          rpcUrl: env.rpc.rinkeby,
          network: SupportedChainId.RINKEBY,
        },
        fleek: env.fleek,
        ipfsGateway: 'snapshot.mypinata.cloud',
      })
    : Snapshot.productionConfiguration({
        ethereum: {
          zDAOChef: env.contract.zDAOChef.mainnet,
          rpcUrl: env.rpc.mainnet,
          network: SupportedChainId.RINKEBY,
          blockNumber: env.contract.zDAOChef.mainnetBlock,
        },
        zNA: {
          zDAORegistry: env.contract.zDAORegistry.mainnet,
          zNSHub: env.contract.zNSHub.mainnet,
          rpcUrl: env.rpc.mainnet,
          network: SupportedChainId.MAINNET,
        },
        fleek: env.fleek,
        ipfsGateway: 'snapshot.mypinata.cloud',
      });

  const sdkInstance: Snapshot.SDKInstance = await Snapshot.createSDKInstance(
    config
  );

  // await createZDAO(sdkInstance, signer, env);
  // await createToken(sdkInstance, signer);
  // await pagination(sdkInstance);
  // await immediateVote(sdkInstance, signer);

  const zNAs: zNA[] = await sdkInstance.listZNAs();
  console.log('zNAs', zNAs);

  // create zdao which is associated with `wilder.cats`
  for (const zNA of zNAs) {
    console.log('> zNA:', zNA);
    const dao = await sdkInstance.getZDAOByZNA(zNA);
    console.log('zDAO instance', dao);

    const proposals: Snapshot.Proposal[] = await dao.listProposals();
    console.log('proposals', proposals.length);

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
