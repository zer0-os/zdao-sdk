import { Provider } from '@ethersproject/providers';
import { configuration } from '@zero-tech/zns-sdk';

import { Config, SupportedChainId } from '../types';

type AddressMap = { [chainId: number]: string };

export const zDAORegistryAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x7701913b65C9bCDa4d353F77EC12123d57D77f1e',
  [SupportedChainId.RINKEBY]: '0x73D44dEa3A3334aB2504443479aD531FfeD2d2D9',
  [SupportedChainId.GOERLI]: '0x4d681D8245e956E1cb295Abe870DF6736EA5F70e',
};

export const zNSHubAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x6141d5cb3517215a03519a464bf9c39814df7479',
  [SupportedChainId.RINKEBY]: '0x7F918CbbBf37e4358ad5f060F15110151d14E59e',
  [SupportedChainId.GOERLI]: '0xce1fE2DA169C313Eb00a2bad25103D2B9617b5e1',
};

export const DEFAULT_PROPOSAL_CHOICES = ['Approve', 'Deny'];

export const developmentConfiguration = (
  provider: Provider,
  ipfsGateway = 'zer0.infura-ipfs.io'
): Config => ({
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    ipfsGateway,
    network: SupportedChainId.GOERLI.toString(),
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.goerli.gnosis.io',
    gateway: 'https://safe-client.staging.gnosisdev.com',
    ipfsGateway,
  },
  zNA: {
    zDAORegistry: zDAORegistryAddress[SupportedChainId.GOERLI],
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry-goerli',
    zNSHub: zNSHubAddress[SupportedChainId.GOERLI],
  },
  provider,
  zNS: configuration.goerliConfiguration(provider),
});

export const productionConfiguration = (
  provider: Provider,
  ipfsGateway = 'zer0.infura-ipfs.io'
): Config => ({
  snapshot: {
    serviceUri: 'https://hub.snapshot.org',
    ipfsGateway,
    network: SupportedChainId.MAINNET.toString(),
  },
  gnosisSafe: {
    serviceUri: 'https://safe-transaction.gnosis.io',
    gateway: 'https://safe-client.gnosis.io',
    ipfsGateway,
  },
  zNA: {
    zDAORegistry: zDAORegistryAddress[SupportedChainId.MAINNET],
    subgraphUri:
      'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry',
    zNSHub: zNSHubAddress[SupportedChainId.MAINNET],
  },
  provider,
  zNS: configuration.mainnetConfiguration(provider),
});
