import * as dotenv from 'dotenv';

dotenv.config();

export const setEnv = () => {
  return {
    rpc: {
      rinkeby: process.env.RINKEBY_RPC_URL!,
      goerli: process.env.GOERLI_RPC_URL!,
      mumbai: process.env.MUMBAI_RPC_URL!,
      mainnet: process.env.MAINNET_RPC_URL!,
      polygon: process.env.POLYGON_RPC_URL!,
    },
    contract: {
      zDAORegistry: {
        rinkeby: process.env.RINKEBY_ZDAOREGISTRY_ADDRESS!,
        goerli: process.env.RINKEBY_ZDAOREGISTRY_ADDRESS!,
      },
      zDAOChef: {
        goerli: process.env.GOERLI_ZDAOCHEF_ADDRESS!,
        goerliBlock: process.env.GOERLI_BLOCK_NUMBER!,
        mumbai: process.env.MUMBAI_ZDAOCHEF_ADDRESS!,
        mumbaiBlock: process.env.MUMBAI_BLOCK_NUMBER!,
      },
      zNSHub: {
        goerli: process.env.GOERLI_ZNSHUB_ADDRESS!,
      },
      token: {
        goerli: process.env.GOERLI_VOTING_TOKEN!,
        mumbai: process.env.MUMBAI_VOTING_TOKEN!,
      },
    },
    wallet: {
      privateKey: process.env.PRIVATE_KEY!,
      gnosisSafeOwner: process.env.GNOSIS_OWNER_PRIVATE_KEY!,
    },
    fleek: {
      apiKey: process.env.FLEEK_API_KEY!,
      apiSecret: process.env.FLEEK_API_SECRET!,
    },
  };
};
