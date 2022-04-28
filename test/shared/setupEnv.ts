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
      zDAOChef: {
        goerli: process.env.GOERLI_ZDAOCHEF_ADDRESS!,
        mumbai: process.env.MUMBAI_ZDAOCHEF_ADDRESS!,
      },
    },
    wallet: {
      privateKey: process.env.PRIVATE_KEY!,
    },
  };
};
