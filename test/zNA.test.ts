import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import { createSDKInstance } from '../src';
import { developmentConfiguration, SupportedChainId } from '../src/config';
import { Config, SDKInstance, zNA } from '../src/types';
import { t } from '../src/utilities/messages';
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
      zNA: 'zDAO.eth',
      title: 'zDAO',
      creator: 'creator',
      network: env.network,
      safeAddress: 'safeAddress',
      owners: ['owner'],
      votingToken: 'voting token',
    });

    const zNAs: zNA[] = await sdkInstance.listZNA();
    expect(zNAs.length).to.be.equal(1);
  });

  it('should throw error if create same zNA', async () => {
    await sdkInstance.createZDAOFromParams({
      zNA: 'zDAO.eth',
      title: 'zDAO',
      creator: 'creator',
      network: env.network,
      safeAddress: 'safeAddress',
      owners: ['owner'],
      votingToken: 'voting token',
    });

    await expect(
      sdkInstance.createZDAOFromParams({
        zNA: 'zDAO.eth',
        title: 'zDAO1',
        creator: 'creator1',
        network: env.network,
        safeAddress: 'safeAddress1',
        owners: ['owner1'],
        votingToken: 'voting token1',
      })
    ).to.be.rejectedWith('zDAO already exists');
  });

  it('should get if created successfully', async () => {
    await sdkInstance.createZDAOFromParams({
      zNA: 'zDAO.eth',
      title: 'zDAO',
      creator: 'creator',
      network: env.network,
      safeAddress: 'safeAddress',
      owners: ['owner'],
      votingToken: 'voting token',
    });

    const zdaoInstance = await expect(sdkInstance.getZDAOByZNA('zDAO.eth')).to
      .be.not.rejected;
    const zdao = zdaoInstance.getZDAO();
    expect(zdao.zNA).to.be.equal('zDAO.eth');
  });

  it('should test with contract integration', async () => {
    // @todo
  });
});
