import {
  Erc20Transfer as GnosisErc20Transfer,
  Transaction as GnosisTransaction,
  Transfer as GnosisTransfer,
} from '@gnosis.pm/safe-react-gateway-sdk';
import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';

import { GnosisSafeClient } from '../src/gnosis-safe';
import {
  AssetType,
  Coin,
  Collectible,
  GnosisSafeConfig,
  SupportedChainId,
} from '../src/types';
import { setEnv } from './shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

use(chaiAsPromised.default);

describe('Gnosis Safe test', async () => {
  const env = setEnv();

  let gnosisSafeClient: GnosisSafeClient;

  before('setup', async () => {
    const config: GnosisSafeConfig = {
      serviceUri: 'https://safe-transaction.goerli.gnosis.io',
      gateway: 'https://safe-client.staging.gnosisdev.com',
    };

    gnosisSafeClient = new GnosisSafeClient(config);
  });

  it('should list assets with test tokens', async () => {
    const gnosisSafeAddress = '0x7a935d07d097146f143A45aA79FD8624353abD5D';
    const token = '0xD53C3bddf27b32ad204e859EB677f709c80E6840';

    // should contain ERC20 tokens
    const balances = await gnosisSafeClient.listAssets(
      gnosisSafeAddress,
      SupportedChainId.RINKEBY.toString()
    );
    const coins = balances.items.map((item: any) => ({
      type: item.tokenInfo.type as string as AssetType,
      address: item.tokenInfo.address,
      decimals: item.tokenInfo.decimals,
      symbol: item.tokenInfo.symbol,
      name: item.tokenInfo.name,
      logoUri: item.tokenInfo.logoUri ?? undefined,
      amount: item.balance,
      amountInUSD: Number(item.fiatBalance),
    }));
    expect(coins.length).to.gte(2);

    // should contain ether token
    const nativeToken = coins.find(
      (item: Coin) => item.type === AssetType.NATIVE_TOKEN
    );
    expect(nativeToken).to.be.not.equal(undefined);

    // should contain zDAOToken
    const votingToken = coins.find(
      (item: Coin) => item.type === AssetType.ERC20 && item.address === token
    );
    expect(votingToken).to.be.not.equal(undefined);

    // should contain ERC721 tokens
    const collectibles = await gnosisSafeClient.listCollectibles(
      gnosisSafeAddress,
      SupportedChainId.RINKEBY.toString()
    );

    const collectible = collectibles.find(
      (item: Collectible) =>
        item.id ===
        '82385085784613862901980440101751000042155349045784956518423312851800568596744'
    );
    expect(collectible).to.be.not.equal(undefined);
  });

  it('should have metadata for `Zer0 Name Service` token', async () => {
    const gnosisSafeAddress = '0x7a935d07d097146f143A45aA79FD8624353abD5D';

    const collectibles = await gnosisSafeClient.listCollectibles(
      gnosisSafeAddress,
      SupportedChainId.RINKEBY.toString()
    );

    // should contain collectibles
    const collectible = collectibles.find(
      (item: Collectible) =>
        item.address === '0xa4F6C921f914ff7972D7C55c15f015419326e0Ca'
    );
    expect(collectible).to.be.not.equal(undefined);
    // should contain metadata
    expect(Object.keys(collectible!.metadata).length).to.be.gt(0);
  });

  it('should not have empty metadata for `Zer0 Name Service` token in Beasts Gnosis Safe', async () => {
    const gnosisSafeAddress = '0x766A9b866930D0C7f673EB8Fc9655D5f782b2B21';

    const collectibles = await gnosisSafeClient.listCollectibles(
      gnosisSafeAddress,
      SupportedChainId.MAINNET.toString()
    );

    // looking for empty meta data
    const patches = collectibles.filter(
      (collectible) => Object.keys(collectible.metadata).length < 1
    );
    expect(patches.length).to.be.equal(0);
  });

  it('should list transactions', async () => {
    const gnosisSafeAddress = '0x7a935d07d097146f143A45aA79FD8624353abD5D';
    const token = '0xD53C3bddf27b32ad204e859EB677f709c80E6840';

    const txs = await gnosisSafeClient.listTransactions(
      gnosisSafeAddress,
      SupportedChainId.RINKEBY.toString()
    );

    // should be not empty
    expect(txs.length).to.be.gt(0);

    const filtered = txs.filter((tx: GnosisTransaction) => {
      const txInfo = tx.transaction.txInfo as GnosisTransfer;
      if ((txInfo.transferInfo.type as string) !== AssetType.ERC20)
        return false;
      const typedInfo = txInfo.transferInfo as unknown as GnosisErc20Transfer;
      return typedInfo.tokenAddress === token;
    });

    expect(filtered.length).to.be.gt(0);

    // should contain tx to `0x8a6AAe4B05601CDe4cecbb99941f724D7292867b`
    const toFiltered = filtered.filter(
      (tx) =>
        (tx.transaction.txInfo as unknown as GnosisTransfer).recipient.value ===
        '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b'
    );
    expect(toFiltered.length).to.be.gt(0);
  });

  it('should check if it is owner', async () => {
    const gnosisSafeAddress = '0x7a935d07d097146f143A45aA79FD8624353abD5D';

    const signer = new ethers.Wallet(
      env.wallet.privateKey,
      new ethers.providers.JsonRpcProvider(env.rpc.rinkeby)
    );

    const notOwner = await gnosisSafeClient.isOwnerAddress(
      signer,
      gnosisSafeAddress,
      '0x8a6AAe4B05601CDe4cecbb99941f724D7292867b'
    );
    expect(notOwner).to.be.equal(false);

    const isOwner = await gnosisSafeClient.isOwnerAddress(
      signer,
      gnosisSafeAddress,
      '0x0905939Cae1b09287872c5D96a41617fF3Bb777a'
    );
    expect(isOwner).to.be.equal(true);
  });
});
