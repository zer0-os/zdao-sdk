import * as dotenv from 'dotenv';
import * as env from 'env-var';

dotenv.config();

export const setEnvPolygon = () => {
  return {
    rpc: {
      rinkeby: env.get('RINKEBY_RPC_URL').required().asString(),
      mainnet: env.get('MAINNET_RPC_URL').required().asString(),
      goerli: env.get('GOERLI_RPC_URL').required().asString(),
      mumbai: env.get('MUMBAI_RPC_URL').required().asString(),
    },
    contract: {
      zDAORegistry: {
        goerli: env
          .get('GOERLI_POLYGON_ZDAOREGISTRY_ADDRESS')
          .required()
          .asString(),
      },
      zDAOChef: {
        goerli: env
          .get('GOERLI_POLYGON_ZDAOCHEF_ADDRESS')
          .required()
          .asString(),
        goerliBlock: env
          .get('GOERLI_POLYGON_ZDAOCHEF_BLOCK_NUMBER')
          .required()
          .asInt(),
        mumbai: env
          .get('MUMBAI_POLYGON_ZDAOCHEF_ADDRESS')
          .required()
          .asString(),
        mumbaiBlock: env
          .get('MUMBAI_POLYGON_ZDAOCHEF_BLOCK_NUMBER')
          .required()
          .asInt(),
      },
      zNSHub: {
        goerli: env.get('GOERLI_POLYGON_ZNSHUB_ADDRESS').required().asString(),
      },
      token: {
        goerli: env.get('GOERLI_VOTING_TOKEN').required().asString(),
        mumbai: env.get('MUMBAI_VOTING_TOKEN').required().asString(),
      },
    },
    gnosisSafe: {
      goerli: {
        address: env.get('GOERLI_GNOSIS_SAFE').required().asString(),
        ownerPrivateKey: env
          .get('GOERLI_GNOSIS_OWNER_PRIVATE_KEY')
          .required()
          .asString(),
      },
    },
    wallet: {
      privateKey: env.get('PRIVATE_KEY').required().asString(),
    },
    fleek: {
      apiKey: env.get('FLEEK_API_KEY').required().asString(),
      apiSecret: env.get('FLEEK_API_SECRET').required().asString(),
    },
    DAOs: {
      goerli: [
        {
          name: 'Wilder Wheels',
          votingToken: '0xa80152CB820463a1B50228D2b8dE50717E849BBd',
          gnosisSafe: '0x44B735109ECF3F1A5FE56F50b9874cEf5Ae52fEa',
          zNAs: ['wilder.wheels', 'wilder.breasts'],
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
      rinkeby: env.get('RINKEBY_RPC_URL').required().asString(),
      mainnet: env.get('MAINNET_RPC_URL').required().asString(),
      goerli: env.get('GOERLI_RPC_URL').required().asString(),
      mumbai: env.get('MUMBAI_RPC_URL').required().asString(),
    },
    contract: {
      zDAORegistry: {
        rinkeby: env
          .get('RINKEBY_SNAPSHOT_ZDAOREGISTRY_ADDRESS')
          .required()
          .asString(),
        mainnet: '', // todo
      },
      zDAOChef: {
        rinkeby: env
          .get('RINKEBY_SNAPSHOT_ZDAOCHEF_ADDRESS')
          .required()
          .asString(),
        rinkebyBlock: env
          .get('RINKEBY_SNAPSHOT_ZDAOCHEF_BLOCK_NUMBER')
          .required()
          .asInt(),
        mainnet: '', // todo
        mainnetBlock: 0, // todo
      },
      zNSHub: {
        rinkeby: env
          .get('RINKEBY_SNAPSHOT_ZNSHUB_ADDRESS')
          .required()
          .asString(),
        mainnet: '', // todo
      },
      token: {
        rinkeby: env.get('RINKEBY_VOTING_TOKEN').required().asString(),
        mainnet: '', // todo
      },
    },
    gnosisSafe: {
      rinkeby: {
        address: env.get('RINKEBY_GNOSIS_SAFE').required().asString(),
        ownerPrivateKey: env
          .get('RINKEBY_GNOSIS_OWNER_PRIVATE_KEY')
          .required()
          .asString(),
      },
    },
    wallet: {
      privateKey: env.get('PRIVATE_KEY').required().asString(),
    },
    fleek: {
      apiKey: env.get('FLEEK_API_KEY').required().asString(),
      apiSecret: env.get('FLEEK_API_SECRET').required().asString(),
    },
    DAOs: {
      rinkeby: [
        {
          name: 'Fixed Duration',
          votingToken: '0x10F6A2795B14f13771d885D72e5925Aff647B565',
          gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
          ens: 'zdao-sky.eth',
          zNAs: ['wilder.wheels'],
          duration: 172800,
        },
        // {
        //   name: 'Flexible Duration',
        //   votingToken: '0xD53C3bddf27b32ad204e859EB677f709c80E6840',
        //   gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
        //   ens: 'joshupgig.eth',
        //   zNAs: ['wilder.kicks'],
        // },
        {
          name: 'ERC721 Enumerable DAO',
          votingToken: '0xa4F6C921f914ff7972D7C55c15f015419326e0Ca',
          gnosisSafe: '0x7a935d07d097146f143A45aA79FD8624353abD5D',
          ens: 'zdao721test.eth',
          zNAs: ['wilder.moto'],
          duration: 86400,
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
