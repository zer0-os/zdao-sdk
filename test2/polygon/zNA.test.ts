import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';

import { createSDKInstance } from '../../src/polygon';
import { developmentConfiguration } from '../../src/polygon/config';
import {
  CreateZDAOParams,
  SDKInstance,
  SupportedChainId,
  zDAO,
} from '../../src/types';
import { errorMessageForError } from '../../src/utilities/messages';
import { setEnv } from '../shared/setupEnv';

use(chaiAsPromised.default);

describe('zNA test', async () => {
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
        blockNumber: env.contract.zDAOChef.goerliBlock,
      },
      polygon: {
        zDAOChef: env.contract.zDAOChef.mumbai,
        rpcUrl: env.rpc.mumbai,
        network: SupportedChainId.MUMBAI,
        blockNumber: env.contract.zDAOChef.mumbaiBlock,
      },
      zNA: {
        zDAORegistry: env.contract.zDAORegistry.goerli,
        zNSHub: env.contract.zNSHub.goerli,
        rpcUrl: env.rpc.goerli,
        network: SupportedChainId.GOERLI,
      },
      proof: {
        from: signer.address,
      },
      fleek: env.fleek,
      ipfsGateway: 'snapshot.mypinata.cloud',
      zNSProvider: rinkebyProvider,
    });

    sdkInstance = await createSDKInstance(config);
  });

  it('should create successfully', async () => {
    const params: CreateZDAOParams = {
      zNA: 'zDAO.eth',
      title: 'zDAO Testing Space 1',
      network: SupportedChainId.RINKEBY,
      gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
      token: '0x1981cc4517AB60A2edcf62f4E5817eA7A89F96fe',
      amount: ethers.BigNumber.from(10000).toString(),
      duration: 3000,
      options: {
        votingThreshold: 5001,
        minimumVotingParticipants: 1,
        minimumTotalVotingTokens: ethers.BigNumber.from(10000).toString(),
        isRelativeMajority: true,
      },
    };
    const zDAO: zDAO = await sdkInstance.createZDAOFromParams(signer, params);

    expect(zDAO.zNAs[0]).to.be.equal('zDAO.eth');
  });

  it('should throw error if create same zNA', async () => {
    const params: CreateZDAOParams = {
      zNA: 'zDAO.eth',
      title: 'zDAO',
      network: SupportedChainId.RINKEBY,
      gnosisSafe: 'gnosisSafe',
      token: '0x1981cc4517AB60A2edcf62f4E5817eA7A89F96fe',
      amount: ethers.BigNumber.from(10000).toString(),
      duration: 3000,
      options: {
        votingThreshold: 5001,
        minimumVotingParticipants: 1,
        minimumTotalVotingTokens: ethers.BigNumber.from(10000).toString(),
        isRelativeMajority: true,
      },
    };
    await sdkInstance.createZDAOFromParams(signer, params);

    await expect(
      sdkInstance.createZDAOFromParams(signer, params)
    ).to.be.rejectedWith(errorMessageForError('already-exist-zdao'));
  });

  it('should exist zDAO', async () => {
    const exist = await sdkInstance.doesZDAOExist('wilder.wheels');
    expect(exist).to.be.eq(true);
  });

  it('should list all the zDAOs', async () => {
    const zNAs = await sdkInstance.listZNAs();
    expect(zNAs.length).to.be.gt(0);
  });

  it('should create zDAO from zNA', async () => {
    const dao: zDAO = await sdkInstance.getZDAOByZNA('wilder.wheels');
    expect(dao).to.be.not.equal(undefined);
    const found = dao.zNAs.find((zNA) => zNA === 'wilder.cats');
    expect(found).to.be.not.undefined;
  });

  it('should associated with zNA', async () => {
    const dao: zDAO = await sdkInstance.getZDAOByZNA('wilder.wheels');

    const found = dao.zNAs.find((zNA) => zNA === 'wilder.wheels');
    expect(found).to.be.not.undefined;
  });

  it('should associated with multiple zNA', async () => {
    const dao: zDAO = await sdkInstance.getZDAOByZNA('wilder.wheels');

    const found = dao.zNAs.filter(
      (zNA) => zNA === 'wilder.kicks' || zNA === 'wilder.wheels'
    );
    expect(found.length).to.be.eq(2);
  });
});
