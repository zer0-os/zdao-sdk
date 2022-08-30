import { SupportedChainId } from '../types';

/* -------------------------------------------------------------------------- */
/*                          Smart Contract Addresses                          */
/* -------------------------------------------------------------------------- */
type AddressMap = { [chainId: number]: string };
export const MultiCallAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [SupportedChainId.RINKEBY]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  [SupportedChainId.GOERLI]: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
  [SupportedChainId.MUMBAI]: '0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc',
  [SupportedChainId.POLYGON]: '0xCBca837161be50EfA5925bB9Cc77406468e76751',
};

export const zDAORegistryAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '', // todo
  [SupportedChainId.RINKEBY]: '0x9c870c0B043E8ce4a7CFa31e82185C7a07fA3573',
  [SupportedChainId.GOERLI]: '0xC9d640CB7a1Cdfa02b31f0AE36c239380B493448',
};

export const zNSHubAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x6141d5cb3517215a03519a464bf9c39814df7479',
  [SupportedChainId.RINKEBY]: '0x7F918CbbBf37e4358ad5f060F15110151d14E59e',
  [SupportedChainId.GOERLI]: '0x9a35367c5e8C01cd009885e497a33a9761938832',
};

/* -------------------------------------------------------------------------- */
/*                                Subgraph Uris                               */
/* -------------------------------------------------------------------------- */
export const zDAORegistrySubgraphUri: AddressMap = {
  [SupportedChainId.MAINNET]:
    'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry',
  [SupportedChainId.RINKEBY]:
    'https://api.thegraph.com/subgraphs/name/deep-quality-dev/zdao-registry-rinkeby',
  [SupportedChainId.GOERLI]:
    'https://api.thegraph.com/subgraphs/name/deep-quality-dev/zdao-registry-goerli',
};

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */
export const DEFAULT_ZDAO_DURATION = 86400;

export const DEFAULT_PROPOSAL_CHOICES = ['Approve', 'Deny'];
