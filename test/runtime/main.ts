import assert from 'assert';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import ZNAClient from '../../src/client/ZNAClient';
import { developmentConfiguration } from '../../src/config';
import TransferAbi from '../../src/config/abi/transfer.json';
import { SupportedChainId } from '../../src/types';
import { setEnv } from '../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const main = async () => {
  const env = setEnv();

  const rinkebyProvider = new ethers.providers.JsonRpcProvider(
    env.rpc.rinkeby,
    SupportedChainId.RINKEBY
  );
  const config = developmentConfiguration({
    ethereum: {
      zDAOChef: env.contract.zDAOChef.goerli,
      provider: new ethers.providers.JsonRpcProvider(
        env.rpc.goerli,
        SupportedChainId.GOERLI
      ),
    },
    polygon: {
      zDAOChef: env.contract.zDAOChef.mumbai,
      provider: new ethers.providers.JsonRpcProvider(
        env.rpc.mumbai,
        SupportedChainId.MUMBAI
      ),
    },
    fleek: env.fleek,
    zNSProvider: rinkebyProvider,
  });
  const goerliSigner = new ethers.Wallet(
    env.wallet.privateKey,
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

  console.log('config', config);
  console.log('signer.address', goerliSigner.address);

  ZNAClient.initialize(config.zNS);

  const zNAId1 = ZNAClient.zNATozNAId('wilder.wheels');
  console.log('zNAId1', zNAId1);
  const zNAId2 = ZNAClient.zNATozNAId('wilder.kicks');
  console.log('zNAId2', zNAId2);

  const instance = createSDKInstance(config);

  await instance.createZDAO(goerliSigner, {
    zNA: 'wilder.kicks',
    title: 'wilder.kicks',
    gnosisSafe: '0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa',
    token: '0x1981cc4517AB60A2edcf62f4E5817eA7A89F96fe',
    amount: BigNumber.from(10).pow(18).toString(),
    isRelativeMajority: false,
    quorumVotes: BigNumber.from(10).pow(18).toString(),
  });

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

  await zDAO.createProposal(goerliSigner, {
    title: 'First 5 min',
    body: 'Hello World',
    duration: 300,
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

  const proposal = proposals[0];
  await proposal.collect(mumbaiSigner);

  console.log('Finished successfully');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
