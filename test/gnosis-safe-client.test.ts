import { expect, use } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { ethers } from 'ethers';

import { developmentConfiguration } from '../src/config';
import GnosisSafeClient from '../src/gnosis-safe';
import { Config } from '../src/types';
import { errorMessageForError } from '../src/utilities/messages';
import { setEnv } from './shared/setupEnv';

(global as any).XMLHttpRequest = require('xhr2');

use(chaiAsPromised.default);

describe.only('Gnosis Safe Client', async () => {
  let config: Config;
  let signer: ethers.Wallet;
  let gnosisSafeClient: GnosisSafeClient;

  before('setup', async () => {
    const env = setEnv();
    const provider = new ethers.providers.JsonRpcProvider(
      env.rpcUrl,
      env.network
    );
    config = developmentConfiguration(provider);
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error(errorMessageForError('no-private-key'));
    signer = new ethers.Wallet(pk, provider);

    gnosisSafeClient = new GnosisSafeClient(config.gnosisSafe);
  });

  it('should create new gnosis safe wallet', async () => {
    const owners = [
      '0x0905939Cae1b09287872c5D96a41617fF3Bb777a',
      '0xa1bD4AaB00f53e7C34bf5fD50DCc885cB918f2dE',
    ];
    const threshold = 1;

    const address = await gnosisSafeClient.deployNewSafe(
      signer,
      owners,
      threshold
    );
    expect(address).to.be.not.equal(ethers.constants.AddressZero);
    console.log(`Created Gnosis Safe wallet: ${address}`);

    const deployedOwners = await gnosisSafeClient.getOwners(signer, address);

    expect(owners.length).to.be.equal(deployedOwners.length);
    const compared = deployedOwners.reduce(
      (prev: boolean, deployedOwner: string) =>
        owners.indexOf(deployedOwner) >= 0 && prev,
      true
    );
    expect(compared).to.be.equal(true);
  });
});
