declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RINKEBY_RPC_URL: string;
      GOERLI_RPC_URL: string;
      MUMBAI_RPC_URL: string;
      MAINNET_RPC_URL: string;
      POLYGON_RPC_URL: string;

      RINKEBY_ZDAOREGISTRY_ADDRESS: string;
      GOERLI_ZDAOREGISTRY_ADDRESS: string;

      GOERLI_BLOCK_NUMBER: number;
      GOERLI_ZDAOCHEF_ADDRESS: string;
      MUMBAI_BLOCK_NUMBER: number;
      MUMBAI_ZDAOCHEF_ADDRESS: string;

      GOERLI_VOTING_TOKEN: string;
      MUMBAI_VOTING_TOKEN: string;

      PRIVATE_KEY: string;
      GNOSIS_OWNER_PRIVATE_KEY: string;

      FLEEK_API_KEY: string;
      FLEEK_API_SECRET: string;
    }
  }
}

export {};
