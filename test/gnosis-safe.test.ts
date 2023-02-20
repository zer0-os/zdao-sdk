import { JsonRpcProvider } from '@ethersproject/providers';
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
  SupportedChainId,
  Transaction,
  TransactionType,
  zDAO,
} from '../src/types';
import { setEnv } from './shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

use(chaiAsPromised.default);

describe('Gnosis Safe test', async () => {
  const env = setEnv(false);

  let sdkInstance: SDKInstance, zDAO: zDAO;

  beforeEach('setup', async () => {
    const provider = new JsonRpcProvider(env.rpcUrl, env.network);
    const config: Config = developmentConfiguration(provider);

    sdkInstance = createSDKInstance(config);

    zDAO = await sdkInstance.createZDAOFromParams({
      ens: 'zdao-ww-kicks.eth',
      zNA: 'wilder.kicks',
      title: 'Wilder Kicks',
      creator: '0x2A83Aaf231644Fa328aE25394b0bEB17eBd12150',
      network: SupportedChainId.MAINNET,
      safeAddress: '0x2A83Aaf231644Fa328aE25394b0bEB17eBd12150',
      votingToken: '0x2a3bFF78B79A009976EeA096a51A948a3dC00e34',
    });
  });

  it('Should have `$WILD`, `$ETH`, and `$WETH` tokens', async () => {
    const assets = await zDAO.listAssets();
    expect(assets.coins.length).to.gte(2);

    // Should have $ETH token
    const nativeToken = assets.coins.find(
      (item: Coin) => item.type === AssetType.NATIVE_TOKEN
    );
    expect(nativeToken).to.be.not.undefined;
    expect(nativeToken?.address).to.be.equal(ethers.constants.AddressZero);
    expect(nativeToken?.amountInUSD).to.be.gt(0);

    // Should have $WETH token
    const wethToken = assets.coins.find(
      (item: Coin) =>
        item.address === '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    );
    expect(wethToken).to.be.not.undefined;
    expect(wethToken?.amountInUSD).to.be.gt(0);

    // Should have `$WILD`
    const wildToken = assets.coins.find(
      (item: Coin) =>
        item.address === '0x2a3bFF78B79A009976EeA096a51A948a3dC00e34'
    );
    expect(wildToken).to.be.not.undefined;
    expect(wildToken?.amountInUSD).to.be.gt(0);
    expect(wildToken?.type).to.be.equal(AssetType.ERC20);
  });

  it('Should have metadata for `Zer0 Name Service` token', async () => {
    const assets = await zDAO.listAssets();

    // Should have zNS NFT token
    const collectibles = assets.collectibles.filter(
      (item: Collectible) =>
        item.address === '0x35D2F3CDAf5e2DeA9e6Ae3553A4CaACBA860A395'
    );
    expect(collectibles.length).to.be.gt(0);
    collectibles.forEach((token: Collectible) => {
      expect(token.tokenName).to.be.equal('Zer0 Name Service');
      expect(token.tokenSymbol).to.be.equal('ZNS');
      expect(token.uri.length).to.be.gt(0);
      expect('name' in token).to.be.true;
      expect('description' in token).to.be.true;
      expect('imageUri' in token).to.be.true;
      expect('metadata' in token).to.be.true;
      if (Object.keys(token.metadata).length > 0) {
        // If has metadata, should have at least the following keys
        expect('name' in token.metadata).to.be.true;
        expect('description' in token.metadata).to.be.true;
        expect('image' in token.metadata).to.be.true;
        expect('attributes' in token.metadata).to.be.true;
      }
    });
  });

  it('Should list transactions', async () => {
    const txs = await zDAO.listTransactions();

    // Should be not empty
    expect(txs.length).to.be.gt(0);

    // Should have `RECEIVE` transaction of $ETH, $WILD, $WETH
    const receivedEth = txs.filter((tx: Transaction) => {
      if (
        tx.asset.type !== AssetType.NATIVE_TOKEN &&
        tx.type !== TransactionType.RECEIVED
      )
        return false;
      return true;
    });
    expect(receivedEth.length).to.be.gt(0);

    const receivedWETH = txs.filter((tx: Transaction) => {
      if (
        tx.asset.type !== AssetType.ERC20 &&
        tx.type !== TransactionType.RECEIVED
      )
        return false;
      const transferInfo = tx.asset as unknown as ERC20Transfer;
      return (
        transferInfo.tokenAddress ===
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
      );
    });
    expect(receivedWETH.length).to.be.gt(0);
  });

  it('Should not have same id in transactions', async () => {
    const txs = await zDAO.listTransactions();

    txs.forEach((tx: Transaction, index: number) => {
      const sameTxs = txs.filter(
        (item, filterIndex) => item.id === tx.id && filterIndex !== index
      );
      expect(sameTxs.length).to.be.equal(0);
    });
  });

  it('should return account details if valid address', async () => {
    const accountDetails = await sdkInstance.safeGlobal.getAccountDetails(
      SupportedChainId.MAINNET.toString(),
      '0x2A83Aaf231644Fa328aE25394b0bEB17eBd12150'
    );
    expect(accountDetails).to.be.not.undefined;
    expect(accountDetails?.network).to.be.equal(
      SupportedChainId.MAINNET.toString()
    );
    expect(accountDetails?.safeAddress).to.be.equal(
      '0x2A83Aaf231644Fa328aE25394b0bEB17eBd12150'
    );
    expect(accountDetails?.owners.length).to.be.gt(1);
    expect(accountDetails?.threshold).to.be.gt(0);
  });

  it('should return undefined if invalid address', async () => {
    const accountDetails = await sdkInstance.safeGlobal.getAccountDetails(
      SupportedChainId.MAINNET.toString(),
      '0x35888AD3f1C0b39244Bb54746B96Ee84A5d97a53'
    );
    expect(accountDetails).to.be.undefined;
  });

  it('should throw error if bad address checksum', async () => {
    await expect(
      sdkInstance.safeGlobal.getAccountDetails(
        SupportedChainId.MAINNET.toString(),
        '0x35888AD3f1C0b39244Bb54746B96Ee84A5d97a54'
      )
    ).to.be.rejected;
  });
});
