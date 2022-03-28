import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';

import { createSDKInstance } from '../src';
import { developmentConfiguration } from '../src/config';
import { Config, SDKInstance, zNA } from '../src/types';
import { setEnv } from './shared/setupEnv';

use(chaiAsPromised.default);

describe('zNA test', async () => {
  const env = setEnv();
  let sdkInstance: SDKInstance;

  beforeEach('setup', async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      env.rpcUrl,
      env.network
    );
    const config: Config = developmentConfiguration(env.zDAOCore, provider);

    sdkInstance = createSDKInstance(config);
  });

  it('should create successfully', async () => {
    await sdkInstance.createZDAOFromParams({
      ens: 'joshupgig.eth',
      zNA: 'joshupgig.eth',
      title: 'zDAO',
      creator: 'creator',
      network: env.network,
      safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
      votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
    });

    const zNAs: zNA[] = await sdkInstance.listZDAOs();
    expect(zNAs.length).to.be.equal(1);
  });

  it('should throw error if create same zNA', async () => {
    await sdkInstance.createZDAOFromParams({
      ens: 'joshupgig.eth',
      zNA: 'zDAO.eth',
      title: 'zDAO',
      creator: 'creator',
      network: env.network,
      safeAddress: 'safeAddress',
      votingToken: 'voting token',
    });

    await expect(
      sdkInstance.createZDAOFromParams({
        ens: 'joshupgig.eth',
        zNA: 'zDAO.eth',
        title: 'zDAO1',
        creator: 'creator1',
        network: env.network,
        safeAddress: 'safeAddress1',
        votingToken: 'voting token1',
      })
    ).to.be.rejectedWith('zDAO already exists');
  });

  it('should get if created successfully', async () => {
    await sdkInstance.createZDAOFromParams({
      ens: 'joshupgig.eth',
      zNA: 'zDAO.eth',
      title: 'zDAO',
      creator: 'creator',
      network: env.network,
      safeAddress: 'safeAddress',
      votingToken: 'voting token',
    });

    const zdaoInstance = await expect(sdkInstance.getZDAOByZNA('zDAO.eth')).to
      .be.not.rejected;

    expect(zdaoInstance.zNA).to.be.equal('zDAO.eth');
  });

  it('should test with contract integration', async () => {
    // @todo
  });
});
