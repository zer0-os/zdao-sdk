import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';
import { developmentConfiguration, SupportedChainId } from '../src/config';
import { createClient } from '../src/gnosis-safe';
import {
  Asset,
  AssetType,
  ERC20Transfer,
  Transaction,
} from '../src/gnosis-safe/types';
import { Config, zDAO } from '../src/types';
import { setEnv } from './shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

use(chaiAsPromised.default);

describe('Gnosis Safe test', async () => {
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

  it('should list assets with test tokens', async () => {
    const gnosisSafe = createClient(config.gnosisSafe, dao);
    const assets = await gnosisSafe.listAssets();
    expect(assets.assets.length).to.gte(2);

    // should contain ether token
    const nativeToken = assets.assets.find(
      (item: Asset) => item.type === AssetType.NATIVE_TOKEN
    );
    expect(nativeToken).to.be.not.equal(undefined);

    // should contain zDAOToken
    const votingToken = assets.assets.find(
      (item: Asset) => item.type === AssetType.ERC20
    );
    expect(votingToken).to.be.not.equal(undefined);
    expect(votingToken?.address).to.be.equal(dao.votingToken);
  });

  it('should list transactions', async () => {
    const gnosisSafe = createClient(config.gnosisSafe, dao);
    const txs = await gnosisSafe.listTransactions();

    // should be not empty
    expect(txs.length).to.be.gt(0);

    // should contain txs from voting token
    const filtered = txs.filter((tx: Transaction) => {
      if (tx.asset.type !== AssetType.ERC20) return false;
      const transferInfo = tx.asset as unknown as ERC20Transfer;
      return transferInfo.tokenAddress === dao.votingToken;
    });
    expect(filtered.length).to.be.gt(0);

    // should contain tx to `0x8a6AAe4B05601CDe4cecbb99941f724D7292867b`
    const toFiltered = filtered.filter(
      (tx: Transaction) =>
        tx.to === '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b'
    );
    expect(toFiltered.length).to.be.gt(0);
  });

  it('should check if it is owner', async () => {
    const gnosisSafe = createClient(config.gnosisSafe, dao);
    const notOwner = await gnosisSafe.isOwnerAddress(
      signer,
      '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b'
    );
    expect(notOwner).to.be.equal(false);

    const isOwner = await gnosisSafe.isOwnerAddress(
      signer,
      '0x0905939Cae1b09287872c5D96a41617fF3Bb777a'
    );
    expect(isOwner).to.be.equal(true);
  });
});
