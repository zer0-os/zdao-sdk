import { assert } from 'chai';
import { ethers } from 'ethers';

import { createSDKInstance } from '../../src';
import { developmentConfiguration, SupportedChainId } from '../../src/config';
import { Asset, AssetType } from '../../src/gnosis-safe/types';
import { zDAO } from '../../src/snapshot-io/types';
import { Config, SDKInstance, ZDAOInstance } from '../../src/types';
import { setEnv } from '../shared/setupEnv';

// (global as any).XMLHttpRequest = require('xhr2');

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
    owners: [
      '0x0905939Cae1b09287872c5D96a41617fF3Bb777a',
      '0xa1bD4AaB00f53e7C34bf5fD50DCc885cB918f2dE',
    ],
    votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
  });

  const daoInstance: ZDAOInstance = await sdkInstance.getZDAOByZNA(defZNA);
  const dao: zDAO = daoInstance.getZDAO();

  const assets = await daoInstance.listAssets();
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
};

main();
