import { assert, expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';

import { SupportedChainId } from '../src';
import { multicall } from '../src/utilities/multicall';
import ERC20Abi from './shared/ERC20.json';
import { setEnv } from './shared/setupEnv';

use(chaiAsPromised.default);

describe('multicall test', async () => {
  const env = setEnv();
  const provider: ethers.providers.JsonRpcProvider =
    new ethers.providers.JsonRpcProvider(env.rpcUrl, env.network);

  it('should get owner successfully', async () => {
    assert.equal(env.network, SupportedChainId.RINKEBY);

    const results = await multicall(
      provider,
      SupportedChainId.RINKEBY,
      ERC20Abi,
      [
        {
          address: '0xa689352b7c1cad82864beb1d90679356d3962f4d',
          name: 'name',
        },
        {
          address: '0xa689352b7c1cad82864beb1d90679356d3962f4d',
          name: 'symbol',
        },
        {
          address: '0xa689352b7c1cad82864beb1d90679356d3962f4d',
          name: 'decimals',
        },
      ]
    );

    expect(results[0][0]).to.be.equal('USDT');
    expect(results[1][0]).to.be.equal('USDT');
    expect(results[2][0]).to.be.equal(18);
  });
});
