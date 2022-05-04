import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../src';
import { developmentConfiguration } from '../src/config';
import {
  CreateZDAOParams,
  SDKInstance,
  SupportedChainId,
  zDAO,
} from '../src/types';
import { errorMessageForError } from '../src/utilities/messages';
import { setEnv } from './shared/setupEnv';

use(chaiAsPromised.default);

describe.only('zNA test', async () => {
  const env = setEnv();
  let sdkInstance: SDKInstance;
  let signer: ethers.Wallet;

  beforeEach('setup', async () => {
    signer = new ethers.Wallet(
      env.wallet.privateKey,
      new ethers.providers.JsonRpcProvider(
        env.rpc.goerli,
        SupportedChainId.GOERLI
      )
    );

    const rinkebyProvider = new ethers.providers.JsonRpcProvider(
      env.rpc.rinkeby,
      SupportedChainId.RINKEBY
    );
    const config = developmentConfiguration({
      ethereum: {
        zDAOChef: env.contract.zDAOChef.goerli,
        rpcUrl: env.rpc.goerli,
        network: SupportedChainId.GOERLI,
        blockNumber: 6828764,
      },
      polygon: {
        zDAOChef: env.contract.zDAOChef.mumbai,
        rpcUrl: env.rpc.mumbai,
        network: SupportedChainId.MUMBAI,
        blockNumber: 26198777,
      },
      proof: {
        from: signer.address,
      },
      fleek: env.fleek,
      zNSProvider: rinkebyProvider,
    });

    sdkInstance = await createSDKInstance(config);
  });

  it('should create successfully', async () => {
    const params: CreateZDAOParams = {
      zNA: 'zDAO.eth',
      title: 'zDAO Testing Space 1',
      gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
      token: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
      amount: BigNumber.from(10000).toString(),
      isRelativeMajority: true,
      quorumVotes: BigNumber.from(10000).toString(),
    };
    const zDAO: zDAO = await sdkInstance.createZDAOFromParams(signer, params);

    expect(zDAO.zNAs[0]).to.be.equal('zDAO.eth');
  });

  it('should throw error if create same zNA', async () => {
    const params: CreateZDAOParams = {
      zNA: 'zDAO.eth',
      title: 'zDAO',
      gnosisSafe: 'gnosisSafe',
      token: 'token',
      amount: BigNumber.from(10000).toString(),
      isRelativeMajority: true,
      quorumVotes: BigNumber.from(10000).toString(),
    };
    await sdkInstance.createZDAOFromParams(signer, params);

    await expect(
      sdkInstance.createZDAOFromParams(signer, params)
    ).to.be.rejectedWith(errorMessageForError('already-exist-zdao'));
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
    const found = dao.zNAs.find((zNA) => zNA === 'wilder.cats');
    expect(found).to.be.not.undefined;
  });

  it('should associated with zNA', async () => {
    const dao: zDAO = await sdkInstance.getZDAOByZNA('wilder.cats');

    const found = dao.zNAs.find((zNA) => zNA === 'wilder.cats');
    expect(found).to.be.not.undefined;
  });

  it('should associated with multiple zNA', async () => {
    const dao: zDAO = await sdkInstance.getZDAOByZNA('wilder.cats');

    const found = dao.zNAs.filter(
      (zNA) => zNA === 'wilder.cats' || zNA === 'wilder.skydao'
    );
    expect(found.length).to.be.eq(2);
  });
});
