import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';
import Sinon from 'sinon';
import { createSDKInstance } from '../src';
import { developmentConfiguration, SupportedChainId } from '../src/config';
import { Asset, AssetType } from '../src/gnosis-safe/types';
import { Config, SDKInstance, ZDAOInstance } from '../src/types';
import { setEnv } from './shared/setupEnv';

use(chaiAsPromised.default);

describe('Gnosis Safe test', async () => {
  const env = setEnv();
  const defZNA = 'joshupgig.eth';
  let sdkInstance: SDKInstance;
  let daoInstance: ZDAOInstance;

  before('setup', async () => {
    (global as any).xhr = Sinon.useFakeXMLHttpRequest();

    const provider = new ethers.providers.JsonRpcProvider(
      env.rpcUrl,
      env.network
    );
    const config: Config = developmentConfiguration(env.zDAOCore, provider);

    sdkInstance = createSDKInstance(config);

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

    daoInstance = await sdkInstance.getZDAOByZNA(defZNA);
  });

  it('should list assets with test tokens', async () => {
    const dao = daoInstance.getZDAO();
    const assets = await daoInstance.listAssets();
    expect(assets.assets.length).to.gt(2);

    // should contain ether token
    const nativeToken = assets.assets.find(
      (item: Asset) => item.type === AssetType.NATIVE_TOKEN
    );
    expect(nativeToken).to.be.not.equal(undefined);

    // should contain zDAOToken
    const votingToken = assets.assets.find(
      (item: Asset) => item.type === AssetType.ERC20
    );
    expect(votingToken).to.be.equal(dao.votingToken);
  });
});
