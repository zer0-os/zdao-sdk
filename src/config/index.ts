import { SupportedChainId } from '../types';

type AddressMap = { [chainId in SupportedChainId]: string };
export const MultiCallAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [SupportedChainId.RINKEBY]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  [SupportedChainId.GOERLI]: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
  [SupportedChainId.MUMBAI]: '0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc',
  [SupportedChainId.POLYGON]: '0xCBca837161be50EfA5925bB9Cc77406468e76751',
};

export const zDAOModuleAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '',
  [SupportedChainId.RINKEBY]: '0x6CF0f6C20ce04dd6Ca3605467B565107A7F0DF0E',
  [SupportedChainId.GOERLI]: '0x97199c4d45037c1D12F24048Ea8a19A564A4b661',
  [SupportedChainId.MUMBAI]: '',
  [SupportedChainId.POLYGON]: '',
};

export const DEFAULT_ZDAO_DURATION = 86400;

export const DEFAULT_PROPOSAL_CHOICES = ['Approve', 'Deny'];

export const zDAOModuleSubgraphUri: AddressMap = {
  [SupportedChainId.MAINNET]:
    'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry',
  [SupportedChainId.RINKEBY]:
    'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry-rinkeby',
  [SupportedChainId.GOERLI]: '',
  [SupportedChainId.MUMBAI]: '',
  [SupportedChainId.POLYGON]: '',
};
