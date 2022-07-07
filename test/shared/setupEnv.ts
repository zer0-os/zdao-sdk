import * as dotenv from 'dotenv';

dotenv.config();

export const setEnvPolygon = () => {
  return {
    rpc: {
      rinkeby: process.env.RINKEBY_RPC_URL!,
      mainnet: process.env.MAINNET_RPC_URL!,
      goerli: process.env.GOERLI_RPC_URL!,
      mumbai: process.env.MUMBAI_RPC_URL!,
    },
    contract: {
      zDAORegistry: {
        goerli: process.env.GOERLI_POLYGON_ZDAOREGISTRY_ADDRESS!,
      },
      zDAOChef: {
        goerli: process.env.GOERLI_POLYGON_ZDAOCHEF_ADDRESS!,
        goerliBlock: Number(process.env.GOERLI_POLYGON_ZDAOCHEF_BLOCK_NUMBER!),
        mumbai: process.env.MUMBAI_POLYGON_ZDAOCHEF_ADDRESS!,
        mumbaiBlock: Number(process.env.MUMBAI_POLYGON_ZDAOCHEF_BLOCK_NUMBER!),
      },
      zNSHub: {
        goerli: process.env.GOERLI_POLYGON_ZNSHUB_ADDRESS!,
      },
      token: {
        goerli: process.env.GOERLI_VOTING_TOKEN!,
        mumbai: process.env.MUMBAI_VOTING_TOKEN!,
      },
    },
    gnosisSafe: {
      goerli: {
        address: process.env.GOERLI_GNOSIS_SAFE!,
        ownerPrivateKey: process.env.GOERLI_GNOSIS_OWNER_PRIVATE_KEY!,
      },
    },
    wallet: {
      privateKey: process.env.PRIVATE_KEY!,
    },
    fleek: {
      apiKey: process.env.FLEEK_API_KEY!,
      apiSecret: process.env.FLEEK_API_SECRET!,
    },
    DAOs: {
      goerli: [
        {
          name: 'Wilder Wheels',
          votingToken: '0xa80152CB820463a1B50228D2b8dE50717E849BBd',
          gnosisSafe: '0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa',
          zNAs: ['wilder.wheels', 'wilder.cats', 'wilder.breasts'],
          duration: 172800, // 2 days
        },
        {
          name: 'Wilder Kicks',
          votingToken: '0xa80152CB820463a1B50228D2b8dE50717E849BBd',
          gnosisSafe: '0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa',
          zNAs: ['wilder.kicks'],
          duration: 600, // 10 min
          isRelativeMajority: true,
        },
        {
          name: 'Wilder Cats',
          votingToken: '0xa80152CB820463a1B50228D2b8dE50717E849BBd',
          gnosisSafe: '0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa',
          zNAs: ['wilder.cats'],
          duration: 1800, // 30 min
          isRelativeMajority: false,
        },
      ],
    },
  };
};

export const setEnvSnapshot = () => {
  return {
    rpc: {
      rinkeby: process.env.RINKEBY_RPC_URL!,
      mainnet: process.env.MAINNET_RPC_URL!,
      goerli: process.env.GOERLI_RPC_URL!,
      mumbai: process.env.MUMBAI_RPC_URL!,
    },
    contract: {
      zDAORegistry: {
        rinkeby: process.env.RINKEBY_SNAPSHOT_ZDAOREGISTRY_ADDRESS!,
        mainnet: process.env.MAINNET_SNAPSHOT_ZDAOREGISTRY_ADDRESS!,
      },
      zDAOChef: {
        rinkeby: process.env.RINKEBY_SNAPSHOT_ZDAOCHEF_ADDRESS!,
        rinkebyBlock: Number(
          process.env.RINKEBY_SNAPSHOT_ZDAOCHEF_BLOCK_NUMBER!
        ),
        mainnet: process.env.MAINNET_SNAPSHOT_ZDAOCHEF_ADDRESS!,
        mainnetBlock: Number(
          process.env.MAINNET_SNAPSHOT_ZDAOCHEF_BLOCK_NUMBER!
        ),
      },
      zNSHub: {
        rinkeby: process.env.RINKEBY_SNAPSHOT_ZNSHUB_ADDRESS!,
        mainnet: '', // todo
      },
      token: {
        rinkeby: process.env.RINKEBY_VOTING_TOKEN!,
        mainnet: '', // todo
      },
    },
    gnosisSafe: {
      rinkeby: {
        address: process.env.RINKEBY_GNOSIS_SAFE!,
        ownerPrivateKey: process.env.RINKEBY_GNOSIS_OWNER_PRIVATE_KEY!,
      },
    },
    wallet: {
      privateKey: process.env.PRIVATE_KEY!,
    },
    fleek: {
      apiKey: process.env.FLEEK_API_KEY!,
      apiSecret: process.env.FLEEK_API_SECRET!,
    },
    DAOs: {
      rinkeby: [
        {
          name: 'Fixed Duration',
          votingToken: '0x10F6A2795B14f13771d885D72e5925Aff647B565',
          gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
          ens: 'zdao-sky.eth',
          duration: 172800,
        },
        {
          name: 'Flexible Duration',
          votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
          gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
          ens: 'joshupgig.eth',
        },
      ],
      mainnet: [
        {
          name: 'Wilder Wheels',
          votingToken: '0x2a3bff78b79a009976eea096a51a948a3dc00e34',
          gnosisSafe: '0xEe7Ad892Fdf8d95223d7E94E4fF42E9d0cfeCAFA',
          ens: 'zdao-wilderwheels.eth',
        },
        {
          name: 'Wilder World',
          votingToken: '0x2a3bff78b79a009976eea096a51a948a3dc00e34',
          gnosisSafe: '0xeD42f85554530B6D5f149d60E5656715BCd4AfdA',
          ens: 'zdao-wilderworld.eth',
        },
      ],
    },
  };
};
