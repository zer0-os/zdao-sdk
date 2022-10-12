import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { BigNumber, ethers } from 'ethers';

import { createSDKInstance } from '../src';
import { developmentConfiguration } from '../src/config';
import { Config, Proposal, SDKInstance, zDAO } from '../src/types';
import { errorMessageForError } from '../src/utilities/messages';
import { setEnv } from './shared/setupEnv';

use(chaiAsPromised.default);

describe.only('Snapshot test', async () => {
  const env = setEnv();

  let signer: ethers.Wallet;
  let sdkInstance: SDKInstance, zDAO: zDAO;

  beforeEach('setup', async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      env.rpcUrl,
      env.network
    );
    const config: Config = developmentConfiguration(provider);
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error(errorMessageForError('no-private-key'));
    signer = new ethers.Wallet(pk, provider);

    sdkInstance = createSDKInstance(config);

    zDAO = await sdkInstance.createZDAOFromParams({
      ens: env.DAOs[0].ens,
      zNA: env.DAOs[0].zNAs[0],
      title: env.DAOs[0].title,
      creator: 'creator',
      network: env.network,
      safeAddress: env.DAOs[0].safeAddress,
      votingToken: env.DAOs[0].votingToken,
    });
  });

  it('should list proposals', async () => {
    const list = await zDAO.listProposals();

    expect(list.length).to.be.gt(0);

    const found = list.filter(
      (item: Proposal) =>
        item.id ===
        '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );
    expect(found.length).to.be.equal(1);
  });

  it('should get proposal detail', async () => {
    const proposal = await zDAO.getProposal(
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );

    expect(proposal.metadata?.token).to.be.equal(zDAO.votingToken);
    expect(proposal.metadata?.recipient).to.be.equal(
      '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b'
    );
    expect(proposal.metadata?.amount).to.be.equal(
      ethers.BigNumber.from(10).pow(18).mul(2300).toString()
    );
  });

  it('should get votes from proposal', async () => {
    const proposal = await zDAO.getProposal(
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
    const proposal = await zDAO.getProposal(
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );

    const vp = await proposal.getVotingPowerOfUser(
      '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C'
    );
    expect(vp).to.be.gt(0);
  });

  it('should create a proposal with `erc20-with-balance` strategy and cast a vote', async () => {
    const blockNumber = await signer.provider.getBlockNumber();
    const proposalId = await zDAO.createProposal(signer, signer.address, {
      title: 'test proposal',
      body: 'body',
      duration: 300, // 5 min
      snapshot: blockNumber,
      choices: ['Yes', 'No', 'Absent'],
      transfer: {
        sender: zDAO.safeAddress,
        recipient: '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b',
        token: zDAO.votingToken.token,
        decimals: zDAO.votingToken.decimals,
        symbol: zDAO.votingToken.symbol,
        amount: BigNumber.from(10).pow(18).mul(3000).toString(),
      },
    });
    expect(proposalId).to.be.not.empty;

    // const vote = await proposal.vote(signer, 1);
    // expect(vote.length).to.be.gt(0);
  });

  it('should create the proposal of fixed duration', async () => {
    const blockNumber = await signer.provider.getBlockNumber();

    // 'zdao-sky.eth' ENS name is associated with 'wilder.cats', 'wilder.skydao'
    const daoInstance2 = await sdkInstance.getZDAOByZNA('wilder.cats');
    expect(daoInstance2.ens).to.be.equal('zdao-sky.eth');

    const proposalId = await daoInstance2.createProposal(
      signer,
      signer.address,
      {
        title: 'test proposal',
        body: 'body',
        snapshot: blockNumber,
        choices: ['Yes', 'No', 'Absent'],
        transfer: {
          sender: zDAO.safeAddress,
          recipient: '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b',
          token: zDAO.votingToken.token,
          decimals: zDAO.votingToken.decimals,
          symbol: zDAO.votingToken.symbol,
          amount: BigNumber.from(10).pow(18).mul(3000).toString(),
        },
      }
    );
    expect(proposalId).to.be.not.empty;
  });
});
