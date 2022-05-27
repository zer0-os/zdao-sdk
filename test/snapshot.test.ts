import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../src';
import DAOClient from '../src/client/DAOClient';
import { developmentConfiguration } from '../src/config';
import TransferAbi from '../src/config/constants/abi/transfer.json';
import {
  Config,
  Proposal,
  SDKInstance,
  SupportedChainId,
  zDAO,
} from '../src/types';
import { errorMessageForError } from '../src/utilities/messages';
import { setEnv } from './shared/setupEnv';

use(chaiAsPromised.default);

describe('Snapshot test', async () => {
  const env = setEnv();
  const defZNA = 'joshupgig.eth';

  let config: Config;
  let signer: ethers.Wallet;
  let daoInstance: zDAO, sdkInstance: SDKInstance;

  before('setup', async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      env.rpcUrl,
      env.network
    );
    config = developmentConfiguration(env.zDAORegistry, provider);
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error(errorMessageForError('no-private-key'));
    signer = new ethers.Wallet(pk, provider);

    sdkInstance = createSDKInstance(config);

    const dao = {
      id: defZNA,
      ens: defZNA,
      zNA: defZNA,
      title: 'zDAO Testing Space 1',
      creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
      network: SupportedChainId.RINKEBY.toString(),
      safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
      votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
    };

    daoInstance = new DAOClient(config, {
      id: dao.id,
      ens: dao.ens,
      zNAs: [dao.zNA],
      title: dao.title,
      creator: dao.creator,
      avatar: undefined,
      network: dao.network,
      safeAddress: dao.safeAddress,
      votingToken: {
        token: dao.votingToken,
        symbol: 'vTEST',
        decimals: 18,
      },
    });
  });

  it('should list proposals', async () => {
    const list = await daoInstance.listProposals();

    expect(list.length).to.be.gt(0);

    const found = list.filter(
      (item: Proposal) =>
        item.id ===
        '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );
    expect(found.length).to.be.equal(1);
  });

  it('should get proposal detail', async () => {
    const proposal = await daoInstance.getProposal(
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );

    expect(proposal.metadata?.token).to.be.equal(daoInstance.votingToken);
    expect(proposal.metadata?.recipient).to.be.equal(
      '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b'
    );
    expect(proposal.metadata?.amount).to.be.equal(
      ethers.BigNumber.from(10).pow(18).mul(2300).toString()
    );
  });

  it('should get votes from proposal', async () => {
    const proposal = await daoInstance.getProposal(
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );

    const votes = await proposal.listVotes();

    expect(votes.length).to.be.equal(1);
    expect(votes[0].choice).to.be.equal(1);
    expect(votes[0].voter).to.be.equal(
      '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C'
    );
  });

  it('should get voting power', async () => {
    const proposal = await daoInstance.getProposal(
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );

    const vp = await proposal.getVotingPowerOfUser(
      '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C'
    );
    expect(vp).to.be.gt(0);
  });

  it('should create a proposal with `erc20-with-balance` strategy and cast a vote', async () => {
    const blockNumber = await signer.provider.getBlockNumber();
    const proposal = await daoInstance.createProposal(signer, {
      title: 'test proposal',
      body: 'body',
      duration: 300, // 5 min
      snapshot: blockNumber,
      transfer: {
        abi: JSON.stringify(TransferAbi),
        sender: daoInstance.safeAddress,
        recipient: '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b',
        token: daoInstance.votingToken.token,
        decimals: daoInstance.votingToken.decimals,
        symbol: daoInstance.votingToken.symbol,
        amount: BigNumber.from(10).pow(18).mul(3000).toString(),
      },
    });
    expect(proposal.title).to.be.eq('test proposal');

    // const vote = await proposal.vote(signer, 1);
    // expect(vote.length).to.be.gt(0);
  });

  it('should create the proposal of fixed duration', async () => {
    const blockNumber = await signer.provider.getBlockNumber();

    // 'zdao-sky.eth' ENS name is associated with 'wilder.cats', 'wilder.skydao'
    const daoInstance2 = await sdkInstance.getZDAOByZNA('wilder.cats');
    expect(daoInstance2.ens).to.be.equal('zdao-sky.eth');

    const proposal = await daoInstance2.createProposal(signer, {
      title: 'test proposal',
      body: 'body',
      snapshot: blockNumber,
      transfer: {
        abi: JSON.stringify(TransferAbi),
        sender: daoInstance.safeAddress,
        recipient: '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b',
        token: daoInstance.votingToken.token,
        decimals: daoInstance.votingToken.decimals,
        symbol: daoInstance.votingToken.symbol,
        amount: BigNumber.from(10).pow(18).mul(3000).toString(),
      },
    });
    expect(proposal.title).to.be.eq('test proposal');
  });
});
