import * as chaiAsPromised from 'chai-as-promised';
import { expect, use } from 'chai';
import { setEnv } from './shared/setupEnv';
import { Proposal, zDAO } from '../src/snapshot-io/types';
import { developmentConfiguration, SupportedChainId } from '../src/config';
import { Config } from '../src/types';
import { BigNumber, ethers } from 'ethers';
import { createClient } from '../src/snapshot-io';

use(chaiAsPromised.default);

describe('Snapshot test', async () => {
  const env = setEnv();
  const defZNA = 'joshupgig.eth';

  const dao: zDAO = {
    id: defZNA,
    zNA: defZNA,
    title: 'zDAO Testing Space 1',
    creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
    network: SupportedChainId.RINKEBY.toString(),
    safeAddress: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
    owners: [
      '0x0905939Cae1b09287872c5D96a41617fF3Bb777a',
      '0xa1bD4AaB00f53e7C34bf5fD50DCc885cB918f2dE',
    ],
    votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
  };
  let config: Config;
  let signer: ethers.Wallet;

  before('setup', async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      env.rpcUrl,
      env.network
    );
    config = developmentConfiguration(env.zDAOCore, provider);
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw Error('No private key');
    signer = new ethers.Wallet(pk, provider);
  });

  it('should list proposals', async () => {
    const snapshot = createClient(config.snapshot, dao);
    const list = await snapshot.listProposals();

    expect(list.length).to.be.gt(0);

    const found = list.filter(
      (item: Proposal) =>
        item.id ===
        '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );
    expect(found.length).to.be.equal(1);
  });

  it('should get proposal detail', async () => {
    const snapshot = createClient(config.snapshot, dao);
    const proposalDetail = await snapshot.getProposalDetail(
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );
    expect(proposalDetail).to.be.not.equal(undefined);

    expect(proposalDetail.metadata?.token).to.be.equal(dao.votingToken);
    expect(proposalDetail.metadata?.recipient).to.be.equal(
      '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b'
    );
    expect(proposalDetail.metadata?.amount).to.be.equal(
      ethers.BigNumber.from(10).pow(18).mul(2300).toString()
    );
  });

  it('should get votes from proposal', async () => {
    const snapshot = createClient(config.snapshot, dao);
    const votes = await snapshot.getProposalVotes(
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989'
    );

    expect(votes.length).to.be.equal(1);
    expect(votes[0].choice).to.be.equal(1);
    expect(votes[0].voter).to.be.equal(
      '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C'
    );
  });

  it('should get results from proposal', async () => {
    const snapshot = createClient(config.snapshot, dao);
    const proposalId =
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989';
    const proposalDetail = await snapshot.getProposalDetail(proposalId);
    const votes = await snapshot.getProposalVotes(proposalId);

    const results = await snapshot.getProposalResults(proposalDetail, votes);
    expect(results.resultsByVoteBalance[0] + results.resultsByVoteBalance[1]).to.be.equal(
      results.sumOfResultsBalance
    );
  });

  it('should get voting power', async () => {
    const snapshot = createClient(config.snapshot, dao);
    const proposalId =
      '0xc0d0f0dfa6ede919e64c06a06d52ce4daf6d2e194042980f30b6c3800d60d989';
    const proposalDetail = await snapshot.getProposalDetail(proposalId);

    const vp = await snapshot.getVotingPower(
      '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
      proposalDetail
    );
    expect(vp).to.be.gt(0);
  });

  it('should create a proposal with `erc20-balance-of` strategy and cast a vote', async () => {
    const snapshot = createClient(config.snapshot, dao);
    const blockNumber = await signer.provider.getBlockNumber();
    const resp = await snapshot.createProposal(signer, {
      title: 'title',
      body: 'body',
      duration: 300, // 5 min
      snapshot: blockNumber,
      transfer: {
        recipient: '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b',
        token: dao.votingToken,
        decimals: 18,
        symbol: 'zDAOToken',
        amount: BigNumber.from(10).pow(18).mul(3000).toString(),
      },
    });
    expect(resp.length).to.be.gt(0);

    const vote = await snapshot.voteProposal(signer, {
      proposal: resp,
      choice: 1,
    });
    expect(vote.length).to.be.gt(0);
  });
});
