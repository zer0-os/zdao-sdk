import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';

import { Polygon } from '../../src';
import { SupportedChainId } from '../../src';
import { createSDKInstance } from '../../src/polygon';
import { developmentConfiguration } from '../../src/polygon/config';
import { errorMessageForError } from '../../src/utilities/messages';
import { setEnvPolygon as setEnv } from '../shared/setupEnv';

use(chaiAsPromised.default);

describe('zNA test', async () => {
  const env = setEnv();
  let sdkInstance: Polygon.SDKInstance;
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
    const params: Polygon.CreateZDAOParams = {
      zNA: 'zDAO.eth',
      name: 'zDAO Testing Space 1',
      network: SupportedChainId.GOERLI,
      gnosisSafe: env.gnosisSafe.goerli.address,
      token: env.contract.token.goerli,
      amount: ethers.BigNumber.from(10000).toString(),
      duration: 3000,
      votingThreshold: 5001,
      minimumVotingParticipants: 1,
      minimumTotalVotingTokens: ethers.BigNumber.from(10000).toString(),
      isRelativeMajority: true,
    };
    const zDAO: Polygon.zDAO = await sdkInstance.createZDAOFromParams(
      signer,
      undefined,
      params
    );

    expect(zDAO.zNAs[0]).to.be.equal('zDAO.eth');
  });

  it('should throw error if create same zNA', async () => {
    const params: Polygon.CreateZDAOParams = {
      zNA: 'zDAO.eth',
      name: 'zDAO',
      network: SupportedChainId.GOERLI,
      gnosisSafe: env.gnosisSafe.goerli.address,
      token: env.contract.token.goerli,
      amount: ethers.BigNumber.from(10000).toString(),
      duration: 3000,
      votingThreshold: 5001,
      minimumVotingParticipants: 1,
      minimumTotalVotingTokens: ethers.BigNumber.from(10000).toString(),
      isRelativeMajority: true,
    };
    await sdkInstance.createZDAOFromParams(signer, undefined, params);

    await expect(
      sdkInstance.createZDAOFromParams(signer, undefined, params)
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
    const dao: Polygon.zDAO = await sdkInstance.getZDAOByZNA('wilder.wheels');
    expect(dao).to.be.not.equal(undefined);
    const found = dao.zNAs.find((zNA) => zNA === 'wilder.cats');
    expect(found).to.be.not.undefined;
  });

  it('should associated with zNA', async () => {
    const dao: Polygon.zDAO = await sdkInstance.getZDAOByZNA('wilder.wheels');

    const found = dao.zNAs.find((zNA) => zNA === 'wilder.wheels');
    expect(found).to.be.not.undefined;
  });

  it('should associated with multiple zNA', async () => {
    const dao: Polygon.zDAO = await sdkInstance.getZDAOByZNA('wilder.wheels');

    const found = dao.zNAs.filter(
      (zNA) => zNA === 'wilder.kicks' || zNA === 'wilder.wheels'
    );
    expect(found.length).to.be.eq(2);
  });
});
