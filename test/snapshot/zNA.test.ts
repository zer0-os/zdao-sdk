import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';

import { Config, createSDKInstance, ZDAOOptions } from '../../src/snapshot';
import { developmentConfiguration } from '../../src/snapshot/config';
import { SDKInstance, zDAO } from '../../src/types';
import { setEnv } from './shared/setupEnv';

use(chaiAsPromised.default);

describe('zNA test', async () => {
  const env = setEnv();
  let sdkInstance: SDKInstance, signer: ethers.Wallet;

  beforeEach('setup', async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      env.rpcUrl,
      env.network
    );
    const config: Config = developmentConfiguration(env.zDAORegistry, provider);

    sdkInstance = createSDKInstance(config);
    signer = new ethers.Wallet(env.wallet.gnosisSafeOwner, provider);
  });

  it('should create successfully', async () => {
    const zDAO: zDAO = await sdkInstance.createZDAOFromParams(signer, {
      zNA: 'joshupgig.eth',
      title: 'zDAO Testing Space 1',
      network: env.network,
      gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
      token: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
      amount: '0',
      duration: 180,
      votingThreshold: 5001,
      isRelativeMajority: true,
      minimumVotingParticipants: 0,
      minimumTotalVotingTokens: '0',
      options: {
        ens: 'joshupgig.eth',
      },
    });

    expect((zDAO.options as ZDAOOptions).ens).to.be.equal('joshupgig.eth');
  });

  it('should throw error if create same zNA', async () => {
    await sdkInstance.createZDAOFromParams(signer, {
      zNA: 'joshupgig.eth',
      title: 'zDAO Testing Space 1',
      network: env.network,
      gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
      token: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
      amount: '0',
      duration: 180,
      votingThreshold: 5001,
      isRelativeMajority: true,
      minimumVotingParticipants: 0,
      minimumTotalVotingTokens: '0',
      options: {
        ens: 'joshupgig.eth',
      },
    });

    await expect(
      sdkInstance.createZDAOFromParams(signer, {
        zNA: 'joshupgig.eth',
        title: 'zDAO Testing Space 1',
        network: env.network,
        gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
        token: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
        amount: '0',
        duration: 180,
        votingThreshold: 5001,
        isRelativeMajority: true,
        minimumVotingParticipants: 0,
        minimumTotalVotingTokens: '0',
        options: {
          ens: 'joshupgig.eth',
        },
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
    expect((dao.options as ZDAOOptions).ens).to.be.equal('zdao-sky.eth');
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
