import { BigNumber } from '@ethersproject/bignumber';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { createSDKInstance } from '../src';
import { developmentConfiguration } from '../src/config';
import { Config, Proposal, SDKInstance, zDAO } from '../src/types';
import { errorMessageForError } from '../src/utilities/messages';
import { setEnv, sleep } from './shared/setupEnv';

use(chaiAsPromised.default);

describe('Snapshot test', async () => {
  const env = setEnv();

  let signer: Wallet;
  let sdkInstance: SDKInstance, zDAO: zDAO;

  beforeEach('setup', async () => {
    const provider = new JsonRpcProvider(env.rpcUrl, env.network);
    const config: Config = developmentConfiguration(provider);
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error(errorMessageForError('no-private-key'));
    signer = new Wallet(pk, provider);

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

  it('Should list proposals', async () => {
    const list = await zDAO.listProposals();

    expect(list.length).to.be.gt(0);

    const found = list.filter(
      (item: Proposal) =>
        item.id ===
        '0x082c3bc0417189d090d7e83083536f5d073737ef9ac32311e888ededa00e4d57'
    );
    expect(found.length).to.be.equal(1);
  });

  it('Should get proposal detail', async () => {
    const proposal = await zDAO.getProposal(
      '0x082c3bc0417189d090d7e83083536f5d073737ef9ac32311e888ededa00e4d57'
    );

    expect(proposal.metadata?.token).to.be.equal(
      '0x009A11617dF427319210e842D6B202f3831e0116'
    );
    expect(proposal.metadata?.recipient).to.be.equal(
      '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C'
    );
    expect(proposal.metadata?.amount).to.be.equal(
      BigNumber.from(10).pow(18).toString()
    );
  });

  it('Should get votes from proposal', async () => {
    const proposal = await zDAO.getProposal(
      '0x082c3bc0417189d090d7e83083536f5d073737ef9ac32311e888ededa00e4d57'
    );

    const votes = await proposal.listVotes();

    expect(votes.length).to.be.equal(1);
    expect(votes[0].choice).to.be.equal(1);
    expect(votes[0].voter).to.be.equal(
      '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C'
    );
  });

  it('Should get voting power', async () => {
    const proposal = await zDAO.getProposal(
      '0x082c3bc0417189d090d7e83083536f5d073737ef9ac32311e888ededa00e4d57'
    );

    const vp = await proposal.getVotingPowerOfUser(
      '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C'
    );
    expect(vp).to.be.gt(0);
  });

  it('Should create a proposal and cast a vote', async () => {
    // Create new proposal
    const blockNumber = await signer.provider.getBlockNumber();
    const proposalId = await zDAO.createProposal(signer, signer.address, {
      title: 'Hello Proposal',
      body: 'Hello World(Test)',
      snapshot: blockNumber,
      choices: ['Yes', 'No', 'Absent'],
      transfer: {
        sender: zDAO.safeAddress,
        recipient: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
        token: zDAO.votingToken.token,
        decimals: zDAO.votingToken.decimals,
        symbol: zDAO.votingToken.symbol,
        amount: BigNumber.from(10).pow(18).mul(3000).toString(),
      },
    });
    expect(proposalId).to.be.not.empty;

    // Wait for 5 seconds to align IPFS
    await sleep(5000);

    // Vote on new proposal
    const proposal = await zDAO.getProposal(proposalId);
    const vote = await proposal.vote(signer, signer.address, 1);
    expect(vote.length).to.be.gt(0);
  });
});
