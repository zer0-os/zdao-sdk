import { JsonRpcProvider } from '@ethersproject/providers';
import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { createSDKInstance } from '../src';
import { developmentConfiguration } from '../src/config';
import { Config, SDKInstance, zDAO } from '../src/types';
import { setEnv } from './shared/setupEnv';

use(chaiAsPromised.default);

describe('zNA test', async () => {
  const env = setEnv();
  let sdkInstance: SDKInstance;

  beforeEach('setup', async () => {
    const provider = new JsonRpcProvider(env.rpcUrl, env.network);
    const config: Config = developmentConfiguration(provider);

    sdkInstance = createSDKInstance(config);
  });

  it('should create successfully', async () => {
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

  it('should throw error if create same zNA', async () => {
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

  it('should exist zDAO', async () => {
    const exist = await sdkInstance.doesZDAOExist('wilder.cats');
    expect(exist).to.be.eq(true);
  });

  it('should list all the zDAOs', async () => {
    const zNAs = await sdkInstance.listZNAs();
    expect(zNAs.length).to.be.gt(0);
  });

  it('should create zDAO from zNA', async () => {
    const dao: zDAO = await sdkInstance.getZDAOByZNA('wilder.cats');
    expect(dao).to.be.not.equal(undefined);
    expect(dao.ens).to.be.equal('zdao-sky.eth');
  });

  it('should associated with zNA', async () => {
    const dao: zDAO = await sdkInstance.getZDAOByZNA('wilder.cats');

    const found = dao.zNAs.find((zNA) => zNA === 'wilder.cats');
    expect(found).to.be.not.equal(undefined);
  });

  it('should associated with multiple zNA', async () => {
    const dao: zDAO = await sdkInstance.getZDAOByZNA('wilder.cats');

    const found = dao.zNAs.filter(
      (zNA) => zNA === 'wilder.cats' || zNA === 'wilder.skydao'
    );
    expect(found.length).to.be.eq(2);
  });
});
