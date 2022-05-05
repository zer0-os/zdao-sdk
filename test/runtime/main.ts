import assert from 'assert';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import ZNAClient from '../../src/client/ZNAClient';
import { developmentConfiguration } from '../../src/config';
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
  //   quorumVotes: BigNumber.from(10).pow(18).toString(),
  // });
  // console.log('zDAO', zDAO);

  // const assets = await zDAO.listAssets();
  // console.log('assets', assets);

  const zNAId1 = ZNAClient.zNATozNAId('wilder.wheels');
  console.log('zNAId1', zNAId1);
  const zNAId2 = ZNAClient.zNATozNAId('wilder.kicks');
  console.log('zNAId2', zNAId2);

  const instance = await createSDKInstance(config);

  // await instance.createZDAO(goerliSigner, {
  //   zNA: 'wilder.wheels',
  //   title: 'wilder.wheels',
  //   gnosisSafe: '0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa',
  //   token: '0x1981cc4517AB60A2edcf62f4E5817eA7A89F96fe',
  //   amount: BigNumber.from(10).pow(18).toString(),
  //   threshold: 5001, // 50.01%
  //   quorumParticipants: 1,
  //   quorumVotes: BigNumber.from(10).pow(18).toString(),
  //   isRelativeMajority: false,
  // });

  const zNAs = await instance.listZNAs();
  console.log('zNAs', zNAs);
  assert.equal(zNAs.length > 0, true);

  const zDAOs = await instance.listZDAOs();
  console.log('zDAOs.length', zDAOs.length);
  assert.equal(zDAOs.length > 0, true);

  const zDAO = await instance.getZDAOByZNA('wilder.wheels');
  console.log('zDAO', zDAO.id, zDAO.title);

  const assets = await zDAO.listAssets();
  console.log('assets', assets);

  // await zDAO.createProposal(goerliSigner, {
  //   title: 'First 50 min',
  //   body: 'Hello World',
  //   duration: 3000,
  //   transfer: {
  //     abi: JSON.stringify(TransferAbi),
  //     sender: zDAO.gnosisSafe,
  //     recipient: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
  //     token: '0x1981cc4517AB60A2edcf62f4E5817eA7A89F96fe',
  //     decimals: 18,
  //     symbol: 'wilder.goerli',
  //     amount: BigNumber.from(10).pow(18).mul(50).toString(),
  //   },
  // });
  // console.log('created proposal');

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
      proposal.voters,
      proposal.canExecute()
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
    } else if (proposal.state === 'queueing') {
      const tx = await proposal.collect(mumbaiSigner);
      console.log('successfully collected on polygon', tx.transactionHash);
    } else if (proposal.state === 'collecting') {
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
    }
  }

  console.log('Finished successfully');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
