import { BigNumber, ethers } from 'ethers';

import { Polygon, ProposalState, SupportedChainId, zNA } from '../../../src';
import { ZNAClient } from '../../../src/client';
import { sleep } from '../../../src/utilities/date';
import { setEnvPolygon as setEnv } from '../../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const createZDAO = async (
  instace: Polygon.SDKInstance,
  signer: ethers.Wallet,
  env: any
) => {
  for (const DAO of env.DAOs.goerli) {
    if (!(await instace.doesZDAOExist(DAO.zNA))) {
      const params: Polygon.CreateZDAOParams = {
        zNA: DAO.zNA,
        name: DAO.name,
        network: SupportedChainId.GOERLI,
        gnosisSafe: env.gnosisSafe.goerli.address,
        token: env.contract.token.goerli,
        amount: BigNumber.from(10).pow(18).toString(),
        duration: DAO.duration,
        votingThreshold: 5001, // 50.01%
        minimumVotingParticipants: 1,
        minimumTotalVotingTokens: BigNumber.from(10).pow(18).toString(),
        isRelativeMajority: DAO.isRelativeMajority ?? true,
      };
      await instace.createZDAO(signer, undefined, params);
      console.log(`DAO ${DAO.zNA} created`);
    }
  }
};

const createProposal = async (
  instance: Polygon.SDKInstance,
  signer: ethers.Wallet,
  zDAO: Polygon.zDAO,
  env: any
) => {
  await zDAO.createProposal(signer, undefined, {
    title: 'Hello Proposal',
    body: 'Hello World',
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

const iterateZDAO = async (
  instance: Polygon.SDKInstance,
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
  const zDAO: Polygon.zDAO = await instance.getZDAOByZNA(zNA);
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
    await instance.staking.stakedERC20Amount(
      mumbaiSigner.address,
      zDAO.votingToken.token
    )
  );

  console.time('listAssets');
  const assets = await zDAO.listAssets();
  console.timeEnd('listAssets');
  // console.log('assets', assets);

  // await createProposal(instance, goerliSigner, zDAO, env);

  console.time('listProposals');
  const proposals: Polygon.Proposal[] = await zDAO.listProposals();
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
      const votingPower = await proposal.getVotingPowerOfUser(
        mumbaiSigner.address
      );
      console.log('votingPower', votingPower);
      if (BigNumber.from(votingPower).gt(BigNumber.from(0))) {
        await proposal.vote(mumbaiSigner, undefined, {
          choice: 2,
        });
        console.log('successfully voted');
      }

      const votes = await proposal.listVotes();
      console.log('votes', votes);
    } else if (proposal.state === ProposalState.AWAITING_CALCULATION) {
      const tx = await proposal.calculate(mumbaiSigner, undefined, {});
      console.log('successfully calculated on polygon');
    } else if (proposal.state === ProposalState.AWAITING_FINALIZATION) {
      const hashes = await (
        proposal as Polygon.Proposal
      ).getCheckPointingHashes();
      console.log('tx hashes', hashes);

      for (const hash of hashes) {
        try {
          console.log('waiting until checkpointed');
          while (!(await (zDAO as Polygon.zDAO).isCheckPointed(hash))) {
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
      console.log('executing', proposal.id);
      await proposal.execute(goerliGnosisOwnerSigner, undefined, {});
      console.log('executed', proposal.id);
    }
  }
};

const main = async () => {
  const env = setEnv();

  const goerliSigner = new ethers.Wallet(
    env.wallet.privateKey,
    new ethers.providers.JsonRpcProvider(
      env.rpc.goerli,
      SupportedChainId.GOERLI
    )
  );

  const rinkebyProvider = new ethers.providers.JsonRpcProvider(
    env.rpc.rinkeby,
    SupportedChainId.RINKEBY
  );

  const config = Polygon.developmentConfiguration({
    ethereum: {
      zDAOChef: env.contract.zDAOChef.goerli,
      rpcUrl: env.rpc.goerli,
      network: SupportedChainId.GOERLI,
      blockNumber: env.contract.zDAOChef.goerliBlock,
    },
    polygon: {
      zDAOChef: env.contract.zDAOChef.mumbai,
      rpcUrl: env.rpc.mumbai,
      network: SupportedChainId.MUMBAI,
      blockNumber: env.contract.zDAOChef.mumbaiBlock,
    },
    zNA: {
      zDAORegistry: env.contract.zDAORegistry.goerli,
      zNSHub: env.contract.zNSHub.goerli,
      rpcUrl: env.rpc.goerli,
      network: SupportedChainId.GOERLI,
    },
    proof: {
      from: goerliSigner.address,
    },
    fleek: env.fleek,
    ipfsGateway: 'snapshot.mypinata.cloud',
    zNSProvider: rinkebyProvider,
  });

  console.log('config', config);
  console.log('signer.address', goerliSigner.address);

  const instance: Polygon.SDKInstance = await Polygon.createSDKInstance(config);

  console.log('instance created');

  const zNAId1 = ZNAClient.zNATozNAId('wilder.wheels');
  console.log('zNAId1', zNAId1);
  const zNAId2 = ZNAClient.zNATozNAId('wilder.kicks');
  console.log('zNAId2', zNAId2);
  const zNAId3 = ZNAClient.zNATozNAId('wilder.cats');
  console.log('zNAId3', zNAId3);
  const zNAId4 = ZNAClient.zNATozNAId('wilder.breasts');
  console.log('zNAId4', zNAId4);

  await createZDAO(instance, goerliSigner, env);

  console.time('listZNAs');
  const zNAs = await instance.listZNAs();
  console.timeEnd('listZNAs');
  console.log('zNAs', zNAs);
  // assert.equal(zNAs.length > 0, true);

  console.time('listZDAOs');
  const zDAOs: Polygon.zDAO[] = await instance.listZDAOs();
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
      zDAO.amount,
      zDAO.duration,
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
  // assert.equal(zDAOs.length > 0, true);

  await iterateZDAO(instance, goerliSigner, 'wilder.kicks', env);

  console.log('Finished successfully');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
