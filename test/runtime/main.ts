import assert from 'assert';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import ZNAClient from '../../src/client/ZNAClient';
import { developmentConfiguration } from '../../src/config';
import TransferAbi from '../../src/config/abi/transfer.json';
import { SupportedChainId } from '../../src/types';
import { sleep } from '../../src/utilities/tx';
import { setEnv } from '../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const main = async () => {
  const env = setEnv();

  const goerliSigner = new ethers.Wallet(
    env.wallet.privateKey,
    new ethers.providers.JsonRpcProvider(
      env.rpc.goerli,
      SupportedChainId.GOERLI
    )
  );

  const goerliGnosisOwnerSigner = new ethers.Wallet(
    env.wallet.gnosisSafeOwner,
    new ethers.providers.JsonRpcProvider(
      env.rpc.goerli,
      SupportedChainId.GOERLI
    )
  );

  const rinkebyProvider = new ethers.providers.JsonRpcProvider(
    env.rpc.rinkeby,
    SupportedChainId.RINKEBY
  );
  const config = developmentConfiguration({
    ethereum: {
      zDAOChef: env.contract.zDAOChef.goerli,
      rpcUrl: env.rpc.goerli,
      network: SupportedChainId.GOERLI,
      blockNumber: 6828764,
    },
    polygon: {
      zDAOChef: env.contract.zDAOChef.mumbai,
      rpcUrl: env.rpc.mumbai,
      network: SupportedChainId.MUMBAI,
      blockNumber: 26198777,
    },
    proof: {
      from: goerliSigner.address,
    },
    fleek: env.fleek,
    zNSProvider: rinkebyProvider,
  });
  const mumbaiSigner = new ethers.Wallet(
    env.wallet.privateKey,
    new ethers.providers.JsonRpcProvider(
      env.rpc.mumbai,
      SupportedChainId.MUMBAI
    )
  );

  console.log('config', config);
  console.log('signer.address', goerliSigner.address);

  // // create MockZDAOClient
  // const zDAO = await MockDAOClient.createInstance(config, goerliSigner, {
  //   zNA: 'wilder.wheels',
  //   title: 'wilder.dao',
  //   gnosisSafe: '0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa',
  //   token: '0x1981cc4517AB60A2edcf62f4E5817eA7A89F96fe',
  //   amount: BigNumber.from(10).pow(18).toString(),
  //   isRelativeMajority: false,
  //   minimumTotalVotingTokens: BigNumber.from(10).pow(18).toString(),
  // });
  // console.log('zDAO', zDAO);

  // const assets = await zDAO.listAssets();
  // console.log('assets', assets);

  const instance = await createSDKInstance(config);
  console.log('instance created');

  console.log('instance.registry', instance.registry);

  const zNAId1 = ZNAClient.zNATozNAId('wilder.wheels');
  console.log('zNAId1', zNAId1);
  const zNAId2 = ZNAClient.zNATozNAId('wilder.kicks');
  console.log('zNAId2', zNAId2);
  const zNAId3 = ZNAClient.zNATozNAId('wilder.cats');
  console.log('zNAId3', zNAId3);
  const zNAId4 = ZNAClient.zNATozNAId('wilder.breasts');
  console.log('zNAId4', zNAId4);

  const staking = instance.staking;
  const stakingAddress = instance.staking.address;
  const power = await staking.stakingPower(
    goerliSigner.address,
    env.token.mumbai
  );
  console.log('staking power', stakingAddress, power);

  // await instance.createZDAO(goerliSigner, {
  //   zNA: 'wilder.kicks',
  //   title: 'wilder.kicks',
  //   gnosisSafe: '0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa',
  //   token: '0x1981cc4517AB60A2edcf62f4E5817eA7A89F96fe',
  //   amount: BigNumber.from(10).pow(18).toString(),
  //   duration: 600, // 15 mins
  //   votingThreshold: 5001, // 50.01%
  //   minimumVotingParticipants: 1,
  //   minimumTotalVotingTokens: BigNumber.from(10).pow(18).toString(),
  //   isRelativeMajority: true,
  // });

  const zNAs = await instance.listZNAs();
  console.log('zNAs', zNAs);
  assert.equal(zNAs.length > 0, true);

  const zDAOs = await instance.listZDAOs();
  console.log('zDAOs.length', zDAOs.length);
  assert.equal(zDAOs.length > 0, true);

  const zDAO = await instance.getZDAOByZNA('wilder.kicks');
  console.log(
    'zDAO',
    zDAO.id,
    zDAO.title,
    zDAO.gnosisSafe,
    zDAO.rootToken,
    zDAO.childToken
  );

  const assets = await zDAO.listAssets();
  console.log('assets', assets);

  await zDAO.createProposal(goerliSigner, {
    title: 'Hello Proposal',
    body: 'Hello World',
    transfer: {
      abi: JSON.stringify(TransferAbi),
      sender: zDAO.gnosisSafe,
      recipient: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
      token: '0x1981cc4517AB60A2edcf62f4E5817eA7A89F96fe',
      decimals: 18,
      symbol: 'wilder.goerli',
      amount: BigNumber.from(10).pow(18).mul(50).toString(),
    },
  });
  console.log('proposal created');

  const proposals = await zDAO.listProposals();
  proposals.forEach((proposal) => {
    console.log(
      proposal.id,
      proposal.createdBy,
      proposal.title,
      proposal.ipfs,
      proposal.state,
      proposal.start,
      proposal.end,
      proposal.scores,
      proposal.voters
    );
  });
  assert.equal(proposals.length > 0, true);

  for (const proposal of proposals) {
    console.log('> proposal.id', proposal.id, proposal.state);

    if (proposal.state === 'active') {
      const votingPower = await proposal.getVotingPowerOfUser(
        mumbaiSigner.address
      );
      console.log('votingPower', votingPower);
      if (BigNumber.from(votingPower).gt(BigNumber.from(0))) {
        await proposal.vote(mumbaiSigner, 2);
        console.log('successfully voted');
      }

      const votes = await proposal.listVotes();
      console.log('votes', votes);
    } else if (proposal.state === 'calculating') {
      const tx = await proposal.collect(mumbaiSigner);
      console.log('successfully collected on polygon', tx.transactionHash);
    } else if (proposal.state === 'finalizing') {
      const hashes = await proposal.collectTxHash();
      console.log('tx hashes', hashes);

      for (const hash of hashes) {
        try {
          while (!(await zDAO.isCheckPointed(hash))) {
            await sleep(1000);
          }
          console.log('tx hash was checkpointed', hash);
          const tx = await zDAO.syncState(goerliSigner, hash);
          console.log('sync state', tx.transactionHash);
        } catch (error) {
          console.error(error);
        }
      }
    } else if (proposal.state === 'succeeded') {
      console.log('executing', proposal.id);
      await proposal.execute(goerliGnosisOwnerSigner);
      console.log('executed', proposal.id);
    }
  }

  console.log('Finished successfully');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
