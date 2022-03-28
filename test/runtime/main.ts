import { createInstance as createZNSInstance } from '@zero-tech/zns-sdk';
import { assert } from 'chai';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import { developmentConfiguration } from '../../src/config';
import {
  AssetType,
  Coin,
  Config,
  SDKInstance,
  SupportedChainId,
  zDAO,
  zNA,
} from '../../src/types';
import { setEnv } from '../shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

const main = async () => {
  const env = setEnv();
  const defZNA = 'joshupgig.eth';

  const provider = new ethers.providers.JsonRpcProvider(
    env.rpcUrl,
    env.network
  );
  const config: Config = developmentConfiguration(env.zDAOCore, provider);

  // check if convert zNA id
  const instance = createZNSInstance(config.zNS);
  const domain1 = await instance.getDomainById(
    BigNumber.from(
      '44092086260530189724903220643220410316896517130862781422418816015878523212802'
    ).toHexString()
  );
  assert.equal(domain1.name, 'wilder.cats');
  const domain2 = await instance.getDomainById(
    BigNumber.from(
      '58634624855272567249009899472384509538335070788124240938864121055227270775796'
    )
      .toHexString()
      .toLowerCase()
  );
  assert.equal(domain2.name, 'wilder.skydao');

  const sdkInstance: SDKInstance = createSDKInstance(config);

  await sdkInstance.createZDAOFromParams({
    ens: 'joshupgig.eth',
    zNA: defZNA,
    title: 'zDAO Testing Space 1',
    creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
    network: SupportedChainId.RINKEBY,
    safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
    votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
  });

  const zNAs: zNA[] = await sdkInstance.listZNAs();
  console.log('zNAs', zNAs);

  // create zdao which is associated with `wilder.cats`
  const dao: zDAO = await sdkInstance.getZDAOByZNA('wilder.cats');
  const dao2: zDAO = await sdkInstance.getZDAOByZNA('wilder.skydao');
  assert.equal(dao.id, dao2.id);

  const assets = await dao.listAssets();
  assert.equal(assets.coins.length >= 2, true);

  // should contain ether token
  const nativeToken = assets.coins.find(
    (item: Coin) => item.type === AssetType.NATIVE_TOKEN
  );
  assert.isNotNull(nativeToken);

  // should contain zDAOToken
  const votingToken = assets.coins.find(
    (item: Coin) => item.type === AssetType.ERC20
  );
  assert.isNotNull(votingToken);
  assert.equal(votingToken?.address, dao.votingToken);

  console.log('Finished successfully');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
