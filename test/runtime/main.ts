import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import {
  developmentConfiguration,
  productionConfiguration,
} from '../../src/config';
import { Config, SDKInstance } from '../../src/types';
import { setEnv } from '../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const main = async () => {
  const isDev = true;
  const env = setEnv(isDev);

  const provider = new ethers.providers.JsonRpcProvider(
    env.rpcUrl,
    env.network
  );
  const config: Config = isDev
    ? developmentConfiguration(env.zDAORegistry, provider)
    : productionConfiguration(env.zDAORegistry, provider);

  const sdkInstance: SDKInstance = createSDKInstance(config);

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  const token = await sdkInstance.createZToken(signer, 'zSample', 'ZSAMPLE', {
    target: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
    amount: BigNumber.from(10).pow(18).mul(10000).toString(),
  });
  console.log('new token', token);

  // await sdkInstance.createZDAOFromParams({
  //   ens: 'joshupgig.eth',
  //   zNA: defZNA,
  //   title: 'zDAO Testing Space 1',
  //   creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
  //   network: SupportedChainId.RINKEBY,
  //   safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
  //   votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
  // });

  // const zNAs: zNA[] = await sdkInstance.listZNAs();
  // console.log('zNAs', zNAs);

  // // create zdao which is associated with `wilder.cats`
  // for (const zNA of zNAs) {
  //   console.log('> zNA:', zNA);
  //   const dao: zDAO = await sdkInstance.getZDAOByZNA(zNA);
  //   console.log('zDAO instance', dao);

  //   const proposals = await dao.listProposals();
  //   console.log('proposals', proposals);

  //   const assets = await dao.listAssets();
  //   console.log('assets', assets);

  //   const txs = await dao.listTransactions();
  //   console.log('transactions', txs);
  // }
  console.log('Finished successfully');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
