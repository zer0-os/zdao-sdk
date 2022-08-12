import { SupportedChainId } from '../types';

/* -------------------------------------------------------------------------- */
/*                          Smart Contract Addresses                          */
/* -------------------------------------------------------------------------- */
type AddressMap = { [chainId in SupportedChainId]: string };
export const MultiCallAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x1F98415757620B543A52E61c46B32eB19261F984',
  [SupportedChainId.RINKEBY]: '0x42ad527de7d4e9d9d011ac45b31d8551f8fe9821',
  [SupportedChainId.GOERLI]: '0x77dca2c955b15e9de4dbbcf1246b4b85b651e50e',
  [SupportedChainId.MUMBAI]: '0x08411ADd0b5AA8ee47563b146743C13b3556c9Cc',
  [SupportedChainId.POLYGON]: '0xCBca837161be50EfA5925bB9Cc77406468e76751',
};

export const zDAORegistryAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '',
  [SupportedChainId.RINKEBY]: '0x2ae829089678d90027279ab36AE99928F53D8b9e',
  [SupportedChainId.GOERLI]: '0xd04B0A93E42345F689d5278AB1c6661D5B540920',
  [SupportedChainId.MUMBAI]: '',
  [SupportedChainId.POLYGON]: '',
};

export const zNSHubAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '0x6141d5cb3517215a03519a464bf9c39814df7479',
  [SupportedChainId.RINKEBY]: '0x7F918CbbBf37e4358ad5f060F15110151d14E59e',
  [SupportedChainId.GOERLI]: '0x9a35367c5e8C01cd009885e497a33a9761938832',
  [SupportedChainId.MUMBAI]: '',
  [SupportedChainId.POLYGON]: '',
};

export const zDAOModuleAddress: AddressMap = {
  [SupportedChainId.MAINNET]: '',
  [SupportedChainId.RINKEBY]: '0xa2E65CB5864E8425A13f7406b86da87ed7b11ae4',
  [SupportedChainId.GOERLI]: '0x97199c4d45037c1D12F24048Ea8a19A564A4b661',
  [SupportedChainId.MUMBAI]: '',
  [SupportedChainId.POLYGON]: '',
};

/* -------------------------------------------------------------------------- */
/*                                Subgraph Uris                               */
/* -------------------------------------------------------------------------- */
export const zDAOModuleSubgraphUri: AddressMap = {
  [SupportedChainId.MAINNET]:
    'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry',
  [SupportedChainId.RINKEBY]:
    'https://api.thegraph.com/subgraphs/name/zer0-os/zdao-registry-rinkeby',
  [SupportedChainId.GOERLI]:
    'https://api.thegraph.com/subgraphs/name/deep-quality-dev/zdao-registry-goerli',
  [SupportedChainId.MUMBAI]: '',
  [SupportedChainId.POLYGON]: '',
};

/* -------------------------------------------------------------------------- */
/*                             DAO Configurations                             */
/* -------------------------------------------------------------------------- */
export const ethereumZDAOConfig = {
  [SupportedChainId.MAINNET]: {
    zDAOChef: '', // todo
  },
  [SupportedChainId.RINKEBY]: {
    zDAOChef: '', // todo
  },
  [SupportedChainId.GOERLI]: {
    zDAOChef: '0x3760E3Ee7c6542A782D49EC4F0c2C92c9647c2df', // todo
  },
};

export const DEFAULT_ZDAO_DURATION = 86400;

export const DEFAULT_PROPOSAL_CHOICES = ['Approve', 'Deny'];
