import { JsonRpcProvider } from '@ethersproject/providers';
import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { createSDKInstance } from '../src';
import { productionConfiguration } from '../src/config';
import { Config, SDKInstance, zDAO } from '../src/types';
import { setEnv } from './shared/setupEnv';

use(chaiAsPromised.default);

describe('zNA test', async () => {
  const title = 'wilder';
  const env = setEnv(false);
  let sdkInstance: SDKInstance;

  beforeEach('setup', async () => {
    const provider = new JsonRpcProvider(env.rpcUrl, env.network);
    const config: Config = productionConfiguration(provider);

    sdkInstance = createSDKInstance(config);
  });

  it('Should create successfully', async () => {
    const zDAO: zDAO = await sdkInstance.createZDAOFromParams({
      ens: env.DAOs[0].ens,
      zNA: env.DAOs[0].zNAs[0],
      title: env.DAOs[0].title,
      creator: 'creator',
      network: env.network,
      safeAddress: env.DAOs[0].safeAddress,
      votingToken: env.DAOs[0].votingToken,
    });
    expect(zDAO.ens).to.be.equal(env.DAOs[0].ens);
  });

  it('Should throw error if create same zNA', async () => {
    await sdkInstance.createZDAOFromParams({
      ens: env.DAOs[0].ens,
      zNA: env.DAOs[0].zNAs[0],
      title: env.DAOs[0].title,
      creator: 'creator',
      network: env.network,
      safeAddress: env.DAOs[0].safeAddress,
      votingToken: env.DAOs[0].votingToken,
    });

    await expect(
      sdkInstance.createZDAOFromParams({
        ens: env.DAOs[0].ens,
        zNA: env.DAOs[0].zNAs[0],
        title: env.DAOs[0].title,
        creator: 'creator',
        network: env.network,
        safeAddress: env.DAOs[0].safeAddress,
        votingToken: env.DAOs[0].votingToken,
      })
    ).to.be.rejectedWith('zDAO already exists');
  });

  it('Should exist zDAO', async () => {
    const exist = await sdkInstance.doesZDAOExist(title);
    expect(exist).to.be.eq(true);
  });

  it('Should list all the zNAs', async () => {
    const zNAs = await sdkInstance.listZNAs();
    expect(zNAs.length).to.be.gt(0);
  });

  it('Should create zDAO from zNA', async () => {
    const dao: zDAO = await sdkInstance.getZDAOByZNA(title);
    expect(dao).to.be.not.equal(undefined);
    expect(dao.ens).to.be.equal('zdao-wilderworld.eth');
  });

  it('Should associated with zNA', async () => {
    const dao: zDAO = await sdkInstance.getZDAOByZNA(title);

    const found = dao.zNAs.find((zNA) => zNA === title);
    expect(found).to.be.not.equal(undefined);
  });
});
