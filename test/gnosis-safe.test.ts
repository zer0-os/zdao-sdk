import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';

import { createSDKInstance } from '../src';
import { developmentConfiguration } from '../src/config';
import {
  AssetType,
  Coin,
  Collectible,
  Config,
  ERC20Transfer,
  SDKInstance,
  Transaction,
  zDAO,
} from '../src/types';
import { setEnv } from './shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

use(chaiAsPromised.default);

describe('Gnosis Safe test', async () => {
  const env = setEnv();

  let sdkInstance: SDKInstance, zDAO: zDAO;

  beforeEach('setup', async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      env.rpcUrl,
      env.network
    );
    const config: Config = developmentConfiguration(provider);

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

  it('should list assets with test tokens', async () => {
    const assets = await zDAO.listAssets();
    expect(assets.coins.length).to.gte(2);

    // should contain ether token
    const nativeToken = assets.coins.find(
      (item: Coin) => item.type === AssetType.NATIVE_TOKEN
    );
    expect(nativeToken).to.be.not.equal(undefined);

    // should contain zDAOToken
    const votingToken = assets.coins.find(
      (item: Coin) =>
        item.type === AssetType.ERC20 && item.address === zDAO.votingToken.token
    );
    expect(votingToken).to.be.not.equal(undefined);

    // should contain collectibles
    const collectible = assets.collectibles.find(
      (item: Collectible) =>
        item.id ===
        '82385085784613862901980440101751000042155349045784956518423312851800568596744'
    );
    expect(collectible).to.be.not.equal(undefined);
  });

  it('should have metadata for `Zer0 Name Service` token', async () => {
    const assets = await zDAO.listAssets();

    // should contain collectibles
    const collectible = assets.collectibles.find(
      (item: Collectible) =>
        item.address === '0xa4F6C921f914ff7972D7C55c15f015419326e0Ca'
    );
    expect(collectible).to.be.not.equal(undefined);
    // should contain metadata
    expect(Object.keys(collectible!.metadata).length).to.be.gt(0);
  });

  it('should not have empty metadata for `Zer0 Name Service` token in Beasts Gnosis Safe', async () => {
    const assets = await zDAO.listAssets();

    // looking for empty meta data
    const patches = assets.collectibles.filter(
      (collectible) => Object.keys(collectible.metadata).length < 1
    );
    expect(patches.length).to.be.equal(0);
  });

  it('should list transactions', async () => {
    const txs = await zDAO.listTransactions();

    // should be not empty
    expect(txs.length).to.be.gt(0);

    // should contain txs from voting token
    const filtered = txs.filter((tx: Transaction) => {
      if (tx.asset.type !== AssetType.ERC20) return false;
      const transferInfo = tx.asset as unknown as ERC20Transfer;
      return transferInfo.tokenAddress === zDAO.votingToken.token;
    });
    expect(filtered.length).to.be.gt(0);

    // should contain tx to `0x8a6AAe4B05601CDe4cecbb99941f724D7292867b`
    const toFiltered = filtered.filter(
      (tx: Transaction) =>
        tx.to === '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b'
    );
    expect(toFiltered.length).to.be.gt(0);
  });
});
