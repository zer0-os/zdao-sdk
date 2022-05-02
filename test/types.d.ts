declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RINKEBY_RPC_URL: string;
      GOERLI_RPC_URL: string;
      MUMBAI_RPC_URL: string;
      MAINNET_RPC_URL: string;
      POLYGON_RPC_URL: string;

      GOERLI_ZDAOCHEF_ADDRESS: string;
      MUMBAI_ZDAOCHEF_ADDRESS: string;

      PRIVATE_KEY: string;

      FLEEK_API_KEY: string;
      FLEEK_API_SECRET: string;
    }
  }
}

export {};
