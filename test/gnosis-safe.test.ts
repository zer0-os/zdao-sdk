import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';

import DAOClient from '../src/client/DAOClient';
import { developmentConfiguration } from '../src/config';
import GnosisSafeClient from '../src/gnosis-safe';
import {
  AssetType,
  Coin,
  Collectible,
  Config,
  ERC20Transfer,
  SupportedChainId,
  Transaction,
  zDAO,
} from '../src/types';
import { errorMessageForError } from '../src/utilities/messages';
import { setEnv } from './shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

use(chaiAsPromised.default);

describe('Gnosis Safe test', async () => {
  const env = setEnv();
  const defZNA = 'joshupgig.eth';

  let config: Config;
  let signer: ethers.Wallet;
  let daoInstance: zDAO;

  before('setup', async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      env.rpcUrl,
      env.network
    );
    config = developmentConfiguration(env.zDAORegistry, provider);
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error(errorMessageForError('no-private-key'));
    signer = new ethers.Wallet(pk, provider);

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

    daoInstance = await DAOClient.createInstance(
      config,
      {
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
      },
      undefined
    );
  });

  it('should list assets with test tokens', async () => {
    const assets = await daoInstance.listAssets();
    expect(assets.coins.length).to.gte(2);

    // should contain ether token
    const nativeToken = assets.coins.find(
      (item: Coin) => item.type === AssetType.NATIVE_TOKEN
    );
    expect(nativeToken).to.be.not.equal(undefined);

    // should contain zDAOToken
    const votingToken = assets.coins.find(
      (item: Coin) =>
        item.type === AssetType.ERC20 &&
        item.address === daoInstance.votingToken.token
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

    const daoInstance = await DAOClient.createInstance(
      config,
      {
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
      },
      undefined
    );
    const assets = await daoInstance.listAssets();

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
    const dao = {
      id: defZNA,
      ens: defZNA,
      zNA: defZNA,
      title: 'zDAO Testing Space 1',
      creator: '0x22C38E74B8C0D1AAB147550BcFfcC8AC544E0D8C',
      network: SupportedChainId.MAINNET.toString(),
      safeAddress: '0x766A9b866930D0C7f673EB8Fc9655D5f782b2B21',
      votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
    };

    const daoInstance = await DAOClient.createInstance(
      config,
      {
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
      },
      undefined
    );
    const assets = await daoInstance.listAssets();

    // looking for empty meta data
    const patches = assets.collectibles.filter(
      (collectible) => Object.keys(collectible.metadata).length < 1
    );
    expect(patches.length).to.be.equal(0);
  });

  it('should list transactions', async () => {
    const txs = await daoInstance.listTransactions();

    // should be not empty
    expect(txs.length).to.be.gt(0);

    // should contain txs from voting token
    const filtered = txs.filter((tx: Transaction) => {
      if (tx.asset.type !== AssetType.ERC20) return false;
      const transferInfo = tx.asset as unknown as ERC20Transfer;
      return transferInfo.tokenAddress === daoInstance.votingToken.token;
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
    const gnosisSafe = new GnosisSafeClient(config.gnosisSafe);
    const notOwner = await gnosisSafe.isOwnerAddress(
      signer,
      daoInstance.safeAddress,
      '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b'
    );
    expect(notOwner).to.be.equal(false);

    const isOwner = await gnosisSafe.isOwnerAddress(
      signer,
      daoInstance.safeAddress,
      '0x0905939Cae1b09287872c5D96a41617fF3Bb777a'
    );
    expect(isOwner).to.be.equal(true);
  });

  it('should propose transaction by owner', async () => {
    const gnosisSafe = new GnosisSafeClient(config.gnosisSafe);

    const provider = new ethers.providers.JsonRpcProvider(
      env.rpcUrl,
      env.network
    );
    const ownerSigner = new ethers.Wallet(
      process.env.GNOSIS_OWNER_PRIVATE_KEY!,
      provider
    );

    await expect(
      gnosisSafe.transferEther(
        daoInstance.safeAddress,
        ownerSigner,
        '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b',
        '100000000000000'
      )
    ).to.be.not.rejected;

    await expect(
      gnosisSafe.transferERC20(
        daoInstance.safeAddress,
        ownerSigner,
        daoInstance.votingToken.token,
        '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b',
        '100000000000000'
      )
    ).to.be.not.rejected;
  });
});
