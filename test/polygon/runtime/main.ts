import { BigNumber, ethers } from 'ethers';

import { Polygon, ProposalState, SupportedChainId, zNA } from '../../../src';
import { ZNAClient } from '../../../src/client';
import { sleep } from '../../../src/utilities/date';
import { setEnvPolygon as setEnv } from '../../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const createZDAO = async (
  sdkInstance: Polygon.PolygonSDKInstance,
  signer: ethers.Wallet,
  env: any
) => {
  for (const DAO of env.DAOs.goerli) {
    for (const zNA of DAO.zNAs) {
      console.log(DAO.name, zNA, ZNAClient.zNATozNAId(zNA));
    }

    if (!(await sdkInstance.doesZDAOExist(DAO.zNAs[0]))) {
      console.log('creating zDAO', DAO);

      await sdkInstance.createZDAO(signer, undefined, {
        zNA: DAO.zNAs[0],
        name: DAO.name,
        network: SupportedChainId.GOERLI,
        gnosisSafe: env.gnosisSafe.goerli.address,
        votingToken: env.contract.token.goerli,
        minimumVotingTokenAmount: BigNumber.from(10).pow(18).toString(),
        votingDuration: DAO.duration,
        votingThreshold: 5001, // 50.01%
        minimumVotingParticipants: 1,
        minimumTotalVotingTokens: BigNumber.from(10).pow(18).toString(),
        isRelativeMajority: DAO.isRelativeMajority ?? true,
      });

      console.log(`DAO ${DAO.zNAs} created`);
    }
  }
};

const createProposal = async (
  sdkInstance: Polygon.PolygonSDKInstance,
  signer: ethers.Wallet,
  zDAO: Polygon.PolygonZDAO,
  env: any
) => {
  await zDAO.createProposal(signer, undefined, {
    title: 'Hello Proposal',
    body: 'Hello World',
    choices: ['Approve', 'Deny'],
    transfer: {
      sender: zDAO.gnosisSafe,
      recipient: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
      token: env.contract.token.goerli,
      decimals: 18,
      symbol: 'zToken',
      amount: BigNumber.from(10).pow(18).mul(50).toString(),
    },
  });
  console.log('proposal created');
};

const iterateZNAs = async (sdkInstance: Polygon.PolygonSDKInstance) => {
  console.time('listZNAs');
  const zNAs = await sdkInstance.listZNAs();
  console.timeEnd('listZNAs');
  console.log('zNAs', zNAs);
  // assert.equal(zNAs.length > 0, true);

  console.time('listZDAOs');
  const zDAOs: Polygon.PolygonZDAO[] = await sdkInstance.listZDAOs();
  console.timeEnd('listZDAOs');
  console.log('zDAOs.length', zDAOs.length);
  zDAOs.forEach((zDAO) => {
    console.log(
      zDAO.id,
      zDAO.zNAs,
      zDAO.name,
      zDAO.createdBy,
      zDAO.network,
      zDAO.gnosisSafe,
      zDAO.votingToken,
      zDAO.minimumVotingTokenAmount,
      zDAO.votingDuration,
      zDAO.votingThreshold,
      zDAO.minimumVotingParticipants,
      zDAO.minimumTotalVotingTokens,
      zDAO.isRelativeMajority,
      zDAO.state,
      zDAO.snapshot,
      zDAO.destroyed,
      zDAO.polygonToken
    );
  });
};

const iterateZDAO = async (
  sdkInstance: Polygon.PolygonSDKInstance,
  goerliSigner: ethers.Wallet,
  zNA: zNA,
  env: any
) => {
  const goerliGnosisOwnerSigner = new ethers.Wallet(
    env.gnosisSafe.goerli.ownerPrivateKey,
    new ethers.providers.JsonRpcProvider(
      env.rpc.goerli,
      SupportedChainId.GOERLI
    )
  );

  const mumbaiSigner = new ethers.Wallet(
    env.wallet.privateKey,
    new ethers.providers.JsonRpcProvider(
      env.rpc.mumbai,
      SupportedChainId.MUMBAI
    )
  );

  console.time('getZDAOByZNA');
  const zDAO: Polygon.PolygonZDAO = await sdkInstance.getZDAOByZNA(zNA);
  console.timeEnd('getZDAOByZNA');
  console.log(
    'zDAO',
    zDAO.id,
    zDAO.name,
    zDAO.gnosisSafe,
    zDAO.votingToken,
    zDAO.polygonToken
  );

  console.log(
    'staked amount',
    await sdkInstance.staking.stakedERC20Amount(
      mumbaiSigner.address,
      zDAO.polygonToken?.token ?? ''
    )
  );

  console.time('listAssets');
  const assets = await zDAO.listAssets();
  console.timeEnd('listAssets');
  // console.log('assets', assets);

  // await createProposal(sdkInstance, goerliSigner, zDAO, env);

  console.time('listProposals');
  const proposals: Polygon.PolygonProposal[] = await zDAO.listProposals();
  console.timeEnd('listProposals');
  proposals.forEach((proposal) => {
    console.log(
      proposal.id,
      proposal.createdBy,
      proposal.title,
      // proposal.body,
      proposal.ipfs,
      proposal.state,
      proposal.start,
      proposal.end,
      proposal.scores,
      proposal.voters
    );
  });
  // assert.equal(proposals.length > 0, true);

  for (const proposal of proposals) {
    console.log('> proposal.id', proposal.id, proposal.state, proposal.ipfs);

    if (proposal.state === ProposalState.ACTIVE) {
      console.log('... voting');
      const votingPower = await proposal.getVotingPowerOfUser(
        mumbaiSigner.address
      );
      console.log('your votingPower', votingPower);
      if (BigNumber.from(votingPower).gt(BigNumber.from(0))) {
        await proposal.vote(mumbaiSigner, undefined, {
          choice: 1,
        });
        console.log('successfully voted');
      }

      const votes = await proposal.listVotes();
      console.log('votes', votes);
    } else if (proposal.state === ProposalState.AWAITING_CALCULATION) {
      console.log('... calculating');

      const tx = await proposal.calculate(mumbaiSigner, undefined, {});
      console.log('successfully calculated on polygon');
    } else if (proposal.state === ProposalState.AWAITING_FINALIZATION) {
      console.log('... finalizing');

      const hashes = await (
        proposal as Polygon.PolygonProposal
      ).getCheckPointingHashes();
      console.log('tx hashes', hashes);

      for (const hash of hashes) {
        try {
          console.log('waiting until checkpointed');
          while (!(await (zDAO as Polygon.PolygonZDAO).isCheckPointed(hash))) {
            await sleep(1000);
          }
          console.log('tx hash was checkpointed', hash);
          await proposal.finalize(goerliSigner, undefined, {
            txHash: hash,
          });
          console.log('sync state');
        } catch (error) {
          console.error(error);
        }
      }
    } else if (proposal.state === ProposalState.AWAITING_EXECUTION) {
      console.log('... executing');
      await proposal.execute(goerliGnosisOwnerSigner, undefined, {});
      console.log('executed', proposal.id);
    }
  }
};

const performance = async (
  sdkInstance: Polygon.PolygonSDKInstance,
  goerliSigner: ethers.Wallet,
  goerliGnosisOwnerSigner: ethers.Wallet
) => {
  console.time('>listZNAs');
  await sdkInstance.listZNAs();
  console.timeEnd('>listZNAs');
  for (let i = 0; i < 1; i++) {
    console.time('>getZDAOByZNA');
    await sdkInstance.getZDAOByZNA('wilder.cats');
    console.timeEnd('>getZDAOByZNA');
  }
};

const main = async () => {
  const env = setEnv();

  const goerliProvider = new ethers.providers.JsonRpcProvider(
    env.rpc.goerli,
    SupportedChainId.GOERLI
  );

  const mumbaiProvider = new ethers.providers.JsonRpcProvider(
    env.rpc.mumbai,
    SupportedChainId.MUMBAI
  );

  const goerliSigner = new ethers.Wallet(env.wallet.privateKey, goerliProvider);

  const rinkebyProvider = new ethers.providers.JsonRpcProvider(
    env.rpc.rinkeby,
    SupportedChainId.RINKEBY
  );

  const config = Polygon.developmentConfiguration({
    ethereumProvider: goerliProvider,
    polygonProvider: mumbaiProvider,
    proof: {
      from: goerliSigner.address,
    },
    fleek: env.fleek,
    ipfsGateway: 'zer0.infura-ipfs.io',
    zNSProvider: rinkebyProvider,
  });

  console.log('config', config);
  console.log('signer.address', goerliSigner.address);

  console.time('createSDKInstance');
  const instance: Polygon.PolygonSDKInstance = await Polygon.createSDKInstance(
    config
  );
  console.timeEnd('createSDKInstance');

  console.log('instance created');

  // await createProposal(
  //   instance,
  //   goerliSigner,
  //   await instance.getZDAOByZNA('wilder.cats'),
  //   env
  // );

  // await createZDAO(instance, goerliSigner, env);
  // await iterateZNAs(instance);
  // await iterateZDAO(instance, goerliSigner, 'wilder.cats', env);

  // const goerliGnosisOwnerSigner = new ethers.Wallet(
  //   env.gnosisSafe.goerli.ownerPrivateKey,
  //   new ethers.providers.JsonRpcProvider(
  //     env.rpc.goerli,
  //     SupportedChainId.GOERLI
  //   )
  // );
  // await performance(instance, goerliSigner, goerliGnosisOwnerSigner);

  console.log('Finished successfully');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
