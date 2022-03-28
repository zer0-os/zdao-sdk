import { assert } from 'chai';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import { developmentConfiguration } from '../../src/config';
import {
  Asset,
  AssetType,
  Config,
  SDKInstance,
  SupportedChainId,
  zDAO,
} from '../../src/types';
import { zNATozNAId } from '../../src/utilities/resolve';
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

  const sdkInstance: SDKInstance = createSDKInstance(config);

  await sdkInstance.createZDAOFromParams({
    zNA: defZNA,
    title: 'zDAO Testing Space 1',
    creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
    network: SupportedChainId.RINKEBY,
    safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
    votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
  });

  const dao: zDAO = await sdkInstance.getZDAOByZNA(defZNA);

  const assets = await dao.listAssets();
  assert.equal(assets.assets.length >= 2, true);

  // should contain ether token
  const nativeToken = assets.assets.find(
    (item: Asset) => item.type === AssetType.NATIVE_TOKEN
  );
  assert.isNotNull(nativeToken);

  // should contain zDAOToken
  const votingToken = assets.assets.find(
    (item: Asset) => item.type === AssetType.ERC20
  );
  assert.isNotNull(votingToken);
  assert.equal(votingToken?.address, dao.votingToken);

  const zNAId = zNATozNAId(defZNA);
  console.log('zNAId', zNAId);

  const bigzNA = BigNumber.from(zNAId);
  console.log('bigzNA', bigzNA.toString());

  console.log('Finished successfully');
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
