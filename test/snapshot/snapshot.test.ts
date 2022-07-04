import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { BigNumber, ethers } from 'ethers';

import { Snapshot } from '../../src';
import { createSDKInstance, SnapshotConfig } from '../../src/snapshot';
import DAOClient from '../../src/snapshot/client/DAOClient';
import { developmentConfiguration } from '../../src/snapshot/config';
import { SupportedChainId, zDAOState } from '../../src/types';
import { errorMessageForError } from '../../src/utilities/messages';
import { setEnvSnapshot as setEnv } from '../shared/setupEnv';

use(chaiAsPromised.default);

describe('Snapshot test', async () => {
  const env = setEnv();
  const defZNA = 'joshupgig.eth';

  let config: SnapshotConfig;
  let signer: ethers.Wallet;
  let daoInstance: Snapshot.SnapshotZDAO,
    sdkInstance: Snapshot.SnapshotSDKInstance;

  before('setup', async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      env.rpc.rinkeby,
      SupportedChainId.RINKEBY
    );
    config = developmentConfiguration({
      ethereum: {
        zDAOChef: env.contract.zDAOChef.rinkeby,
        rpcUrl: env.rpc.rinkeby,
        network: SupportedChainId.RINKEBY,
        blockNumber: env.contract.zDAOChef.rinkebyBlock,
      },
      zNA: {
        zDAORegistry: env.contract.zDAORegistry.rinkeby,
        zNSHub: env.contract.zNSHub.rinkeby,
        rpcUrl: env.rpc.rinkeby,
        network: SupportedChainId.RINKEBY,
      },
      fleek: env.fleek,
      ipfsGateway: 'snapshot.mypinata.cloud',
    });
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error(errorMessageForError('no-private-key'));
    signer = new ethers.Wallet(pk, provider);

    sdkInstance = await createSDKInstance(config);

    const dao = {
      id: defZNA,
      ens: defZNA,
      zNA: defZNA,
      name: 'zDAO Testing Space 1',
      createdBy: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
      network: SupportedChainId.RINKEBY,
      gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
      votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
    };

    daoInstance = await DAOClient.createInstance(
      config,
      {
        id: dao.id,
        zNAs: [dao.zNA],
        name: dao.name,
        createdBy: dao.createdBy,
        network: dao.network,
        gnosisSafe: dao.gnosisSafe,
        votingToken: {
          token: dao.votingToken,
          symbol: 'vTEST',
          decimals: 18,
        },
        amount: '0',
        duration: 180,
        votingThreshold: 5001,
        minimumVotingParticipants: 0,
        minimumTotalVotingTokens: '0',
        isRelativeMajority: true,
        state: zDAOState.ACTIVE,
        snapshot: 0,
        destroyed: false,
        ens: dao.ens,
      },
      undefined
    );
  });

  it('should list proposals', async () => {
    const list: Snapshot.SnapshotProposal[] = await daoInstance.listProposals();

    expect(list.length).to.be.gt(0);

    const found = list.filter(
      (item: Snapshot.SnapshotProposal) =>
        item.id ===
        '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );
    expect(found.length).to.be.equal(1);
  });

  it('should get proposal detail', async () => {
    const proposal: Snapshot.SnapshotProposal = await daoInstance.getProposal(
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );

    expect(proposal.metadata?.token).to.be.equal(daoInstance.votingToken.token);
    expect(proposal.metadata?.recipient).to.be.equal(
      '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b'
    );
    expect(proposal.metadata?.amount).to.be.equal(
      ethers.BigNumber.from(10).pow(18).mul(2300).toString()
    );
  });

  it('should get votes from proposal', async () => {
    const proposal: Snapshot.SnapshotProposal = await daoInstance.getProposal(
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );

    const votes: Snapshot.SnapshotVote[] = await proposal.listVotes();

    expect(votes.length).to.be.equal(1);
    expect(votes[0].choice).to.be.equal(1);
    expect(votes[0].voter).to.be.equal(
      '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C'
    );
  });

  it('should get voting power', async () => {
    const proposal: Snapshot.SnapshotProposal = await daoInstance.getProposal(
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );

    const vp = await proposal.getVotingPowerOfUser(
      '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C'
    );
    expect(BigNumber.from(vp).gt(BigNumber.from(0))).to.be.true;
  });

  it('should create a proposal with `erc20-with-balance` strategy and cast a vote', async () => {
    const blockNumber = await signer.provider.getBlockNumber();

    const params: Snapshot.CreateSnapshotProposalParams = {
      title: 'test proposal',
      body: 'body',
      transfer: {
        sender: daoInstance.gnosisSafe,
        recipient: '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b',
        token: daoInstance.votingToken.token,
        decimals: daoInstance.votingToken.decimals,
        symbol: daoInstance.votingToken.symbol,
        amount: BigNumber.from(10).pow(18).mul(3000).toString(),
      },
      choices: ['Yes', 'No', 'Absent'],
      snapshot: blockNumber,
    };
    const proposalId = await daoInstance.createProposal(
      signer,
      signer.address,
      params
    );
    const proposal: Snapshot.SnapshotProposal = await daoInstance.getProposal(
      proposalId
    );
    expect(proposal.title).to.be.eq('test proposal');

    // const vote = await proposal.vote(signer, 1);
    // expect(vote.length).to.be.gt(0);
  });

  it('should create the proposal of fixed duration', async () => {
    const blockNumber = await signer.provider.getBlockNumber();

    // 'zdao-sky.eth' ENS name is associated with 'wilder.cats', 'wilder.skydao'
    const daoInstance2: Snapshot.SnapshotZDAO = await sdkInstance.getZDAOByZNA(
      'wilder.cats'
    );
    expect(daoInstance2.ens).to.be.equal('zdao-sky.eth');

    const params: Snapshot.CreateSnapshotProposalParams = {
      title: 'test proposal',
      body: 'body',
      transfer: {
        sender: daoInstance.gnosisSafe,
        recipient: '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b',
        token: daoInstance.votingToken.token,
        decimals: daoInstance.votingToken.decimals,
        symbol: daoInstance.votingToken.symbol,
        amount: BigNumber.from(10).pow(18).mul(3000).toString(),
      },
      choices: ['Yes', 'No', 'Absent'],
      snapshot: blockNumber,
    };
    const proposalId = await daoInstance2.createProposal(
      signer,
      signer.address,
      params
    );
    const proposal: Snapshot.SnapshotProposal = await daoInstance.getProposal(
      proposalId
    );
    expect(proposal.title).to.be.eq('test proposal');
  });
});
