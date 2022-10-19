/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ZDAORegistry, ZDAORegistryInterface } from "../ZDAORegistry";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "ensSpace",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "gnosisSafe",
        type: "address",
      },
    ],
    name: "DAOCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
    ],
    name: "DAODestroyed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "endSpace",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "gnosisSafe",
        type: "address",
      },
    ],
    name: "DAOModified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "zNA",
        type: "uint256",
      },
    ],
    name: "LinkAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "zNA",
        type: "uint256",
      },
    ],
    name: "LinkRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "ensSpace",
        type: "string",
      },
      {
        internalType: "address",
        name: "gnosisSafe",
        type: "address",
      },
    ],
    name: "addNewDAO",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "zNA",
        type: "uint256",
      },
    ],
    name: "addZNAAssociation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "zNA",
        type: "uint256",
      },
    ],
    name: "adminAssociateZNA",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "zNA",
        type: "uint256",
      },
    ],
    name: "adminDisassociateZNA",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "ensSpace",
        type: "string",
      },
      {
        internalType: "address",
        name: "gnosisSafe",
        type: "address",
      },
    ],
    name: "adminModifyZDAO",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
    ],
    name: "adminRemoveDAO",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_znsHub",
        type: "address",
      },
    ],
    name: "adminSetZNSHub",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "zNA",
        type: "uint256",
      },
    ],
    name: "doeszDAOExistForzNA",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "ensSpace",
        type: "string",
      },
    ],
    name: "getzDAOByEns",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "ensSpace",
            type: "string",
          },
          {
            internalType: "address",
            name: "gnosisSafe",
            type: "address",
          },
          {
            internalType: "uint256[]",
            name: "associatedzNAs",
            type: "uint256[]",
          },
          {
            internalType: "bool",
            name: "destroyed",
            type: "bool",
          },
        ],
        internalType: "struct IZDAORegistry.ZDAORecord",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
    ],
    name: "getzDAOById",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "ensSpace",
            type: "string",
          },
          {
            internalType: "address",
            name: "gnosisSafe",
            type: "address",
          },
          {
            internalType: "uint256[]",
            name: "associatedzNAs",
            type: "uint256[]",
          },
          {
            internalType: "bool",
            name: "destroyed",
            type: "bool",
          },
        ],
        internalType: "struct IZDAORegistry.ZDAORecord",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "zNA",
        type: "uint256",
      },
    ],
    name: "getzDaoByZNA",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "ensSpace",
            type: "string",
          },
          {
            internalType: "address",
            name: "gnosisSafe",
            type: "address",
          },
          {
            internalType: "uint256[]",
            name: "associatedzNAs",
            type: "uint256[]",
          },
          {
            internalType: "bool",
            name: "destroyed",
            type: "bool",
          },
        ],
        internalType: "struct IZDAORegistry.ZDAORecord",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_znsHub",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "startIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endIndex",
        type: "uint256",
      },
    ],
    name: "listzDAOs",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "ensSpace",
            type: "string",
          },
          {
            internalType: "address",
            name: "gnosisSafe",
            type: "address",
          },
          {
            internalType: "uint256[]",
            name: "associatedzNAs",
            type: "uint256[]",
          },
          {
            internalType: "bool",
            name: "destroyed",
            type: "bool",
          },
        ],
        internalType: "struct IZDAORegistry.ZDAORecord[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "numberOfzDAOs",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "daoId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "zNA",
        type: "uint256",
      },
    ],
    name: "removeZNAAssociation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "zDAORecords",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "ensSpace",
        type: "string",
      },
      {
        internalType: "address",
        name: "gnosisSafe",
        type: "address",
      },
      {
        internalType: "bool",
        name: "destroyed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "znsHub",
    outputs: [
      {
        internalType: "contract IZNSHub",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506122f4806100206000396000f3fe608060405234801561001057600080fd5b506004361061012c5760003560e01c806393b450f4116100ad578063c4d66de811610071578063c4d66de814610291578063c67cdd01146102a4578063ebc31f26146102b7578063f2fde38b146102e9578063f7a664a4146102fc57600080fd5b806393b450f414610222578063946b22e214610235578063974a581714610255578063b0b97ec014610268578063ba636eef1461027b57600080fd5b806362acf0f5116100f457806362acf0f5146101b8578063715018a6146101e35780637200aff9146101eb578063759e6a07146101fe5780638da5cb5b1461021157600080fd5b806304e88a831461013157806323d5ccda1461015a578063246c88dc1461016f578063500e6f9c146101925780635a0a84e2146101a5575b600080fd5b61014461013f366004611db8565b61030f565b6040516101519190611ee5565b60405180910390f35b61016d610168366004611eff565b610544565b005b61018261017d366004611f21565b6105c9565b6040516101519493929190611f3a565b61016d6101a0366004611f89565b610687565b61016d6101b3366004611fe8565b61087b565b6065546101cb906001600160a01b031681565b6040516001600160a01b039091168152602001610151565b61016d610aa8565b61016d6101f9366004611eff565b610ade565b61016d61020c366004611eff565b610c00565b6033546001600160a01b03166101cb565b61016d610230366004611eff565b610d76565b610248610243366004611eff565b610e49565b604051610151919061203f565b610144610263366004611f21565b611197565b61016d610276366004611f21565b611362565b610283611451565b604051908152602001610151565b61016d61029f3660046120a1565b611467565b6101446102b2366004611f21565b61161d565b6102d96102c5366004611f21565b600090815260676020526040902054151590565b6040519015158152602001610151565b61016d6102f73660046120a1565b61175e565b61016d61030a3660046120a1565b6117f9565b610317611bee565b600061035884848080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061184592505050565b600081815260666020526040902054909150806103b35760405162461bcd60e51b81526020600482015260146024820152734e6f207a44414f20617420656e7320737061636560601b60448201526064015b60405180910390fd5b60008181526068602052604090206004015460ff16156104065760405162461bcd60e51b815260206004820152600e60248201526d1e911053c819195cdd1c9bde595960921b60448201526064016103aa565b606860008281526020019081526020016000206040518060a00160405290816000820154815260200160018201805461043e906120be565b80601f016020809104026020016040519081016040528092919081815260200182805461046a906120be565b80156104b75780601f1061048c576101008083540402835291602001916104b7565b820191906000526020600020905b81548152906001019060200180831161049a57829003601f168201915b505050918352505060028201546001600160a01b0316602080830191909152600383018054604080518285028101850182528281529401939283018282801561051f57602002820191906000526020600020905b81548152602001906001019080831161050b575b50505091835250506004919091015460ff161515602090910152925050505b92915050565b6033546001600160a01b0316331461056e5760405162461bcd60e51b81526004016103aa906120f9565b81600081118015610580575060695481105b801561059e575060008181526068602052604090206004015460ff16155b6105ba5760405162461bcd60e51b81526004016103aa9061212e565b6105c48383611878565b505050565b606860205260009081526040902080546001820180549192916105eb906120be565b80601f0160208091040260200160405190810160405280929190818152602001828054610617906120be565b80156106645780601f1061063957610100808354040283529160200191610664565b820191906000526020600020905b81548152906001019060200180831161064757829003601f168201915b50505050600283015460049093015491926001600160a01b03169160ff16905084565b6033546001600160a01b031633146106b15760405162461bcd60e51b81526004016103aa906120f9565b836000811180156106c3575060695481105b80156106e1575060008181526068602052604090206004015460ff16155b6106fd5760405162461bcd60e51b81526004016103aa9061212e565b60008581526068602090815260408083208151601f8801849004840281018401909252868252929161074a9190889088908190840183828082843760009201919091525061184592505050565b905060006107e3836001018054610760906120be565b80601f016020809104026020016040519081016040528092919081815260200182805461078c906120be565b80156107d95780601f106107ae576101008083540402835291602001916107d9565b820191906000526020600020905b8154815290600101906020018083116107bc57829003601f168201915b5050505050611845565b90508082146108075760008181526066602052604080822082905583825290208890555b610815600184018888611c28565b506002830180546001600160a01b0319166001600160a01b03871617905560405188907f04df6dfe7ee1d3efb7a5a9203fc46e1298c7cac1eac410b61d7405a1557231d090610869908a908a908a90612154565b60405180910390a25050505050505050565b6033546001600160a01b031633146108a55760405162461bcd60e51b81526004016103aa906120f9565b60006108e684848080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061184592505050565b6000818152606660205260409020549091501561093c5760405162461bcd60e51b8152602060048201526014602482015273454e5320616c726561647920686173207a44414f60601b60448201526064016103aa565b6040518060a00160405280606954815260200185858080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201829052509385525050506001600160a01b0385166020808401919091526040805183815280830182528185015260609093018290526069548252606881529190208251815582820151805191926109dc92600185019290910190611cac565b5060408201516002820180546001600160a01b0319166001600160a01b0390921691909117905560608201518051610a1e916003840191602090910190611d20565b50608091909101516004909101805460ff191691151591909117905560695460008281526066602052604090819020829055517f526a4ede5e3a32e00a9764bde0eecbb0544853b17bebb12f4a8500ccd513721590610a8290879087908790612154565b60405180910390a2600160696000828254610a9d91906121c1565b909155505050505050565b6033546001600160a01b03163314610ad25760405162461bcd60e51b81526004016103aa906120f9565b610adc600061194a565b565b81600081118015610af0575060695481105b8015610b0e575060008181526068602052604090206004015460ff16155b610b2a5760405162461bcd60e51b81526004016103aa9061212e565b6065546040516331a9108f60e11b815260048101849052839133916001600160a01b0390911690636352211e9060240160206040518083038186803b158015610b7257600080fd5b505afa158015610b86573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610baa91906121d9565b6001600160a01b031614610bf05760405162461bcd60e51b815260206004820152600d60248201526c2737ba103d27209037bbb732b960991b60448201526064016103aa565b610bfa8484611878565b50505050565b81600081118015610c12575060695481105b8015610c30575060008181526068602052604090206004015460ff16155b610c4c5760405162461bcd60e51b81526004016103aa9061212e565b6065546040516331a9108f60e11b815260048101849052839133916001600160a01b0390911690636352211e9060240160206040518083038186803b158015610c9457600080fd5b505afa158015610ca8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ccc91906121d9565b6001600160a01b031614610d125760405162461bcd60e51b815260206004820152600d60248201526c2737ba103d27209037bbb732b960991b60448201526064016103aa565b600083815260676020526040902054848114610d655760405162461bcd60e51b81526020600482015260126024820152711e9390481b9bdd08185cdcdbd8da585d195960721b60448201526064016103aa565b610d6f858561199c565b5050505050565b6033546001600160a01b03163314610da05760405162461bcd60e51b81526004016103aa906120f9565b81600081118015610db2575060695481105b8015610dd0575060008181526068602052604090206004015460ff16155b610dec5760405162461bcd60e51b81526004016103aa9061212e565b600082815260676020526040902054838114610e3f5760405162461bcd60e51b81526020600482015260126024820152711e9390481b9bdd08185cdcdbd8da585d195960721b60448201526064016103aa565b610bfa848461199c565b60695460609083610e955760405162461bcd60e51b8152602060048201526016602482015275737461727420696e646578203d20302c20757365203160501b60448201526064016103aa565b82841115610ed95760405162461bcd60e51b81526020600482015260116024820152701cdd185c9d081a5b99195e080f88195b99607a1b60448201526064016103aa565b808410610f1f5760405162461bcd60e51b81526020600482015260146024820152730e6e8c2e4e840d2dcc8caf0407c40d8cadccee8d60631b60448201526064016103aa565b808310610f635760405162461bcd60e51b81526020600482015260126024820152710cadcc840d2dcc8caf0407c40d8cadccee8d60731b60448201526064016103aa565b8060011415610fa6576040805160008082526020820190925290610f9d565b610f8a611bee565b815260200190600190039081610f825790505b5091505061053e565b6000610fb285856121f6565b610fbd9060016121c1565b905060008167ffffffffffffffff811115610fda57610fda612195565b60405190808252806020026020018201604052801561101357816020015b611000611bee565b815260200190600190039081610ff85790505b50905060005b8281101561118d576068600061102f838a6121c1565b81526020019081526020016000206040518060a001604052908160008201548152602001600182018054611062906120be565b80601f016020809104026020016040519081016040528092919081815260200182805461108e906120be565b80156110db5780601f106110b0576101008083540402835291602001916110db565b820191906000526020600020905b8154815290600101906020018083116110be57829003601f168201915b505050918352505060028201546001600160a01b0316602080830191909152600383018054604080518285028101850182528281529401939283018282801561114357602002820191906000526020600020905b81548152602001906001019080831161112f575b50505091835250506004919091015460ff16151560209091015282518390839081106111715761117161220d565b60200260200101819052508061118690612223565b9050611019565b5095945050505050565b61119f611bee565b60008281526067602052604090205480158015906111be575060695481105b80156111dc575060008181526068602052604090206004015460ff16155b6112285760405162461bcd60e51b815260206004820152601b60248201527f4e6f207a44414f206173736f6369617465642077697468207a4e41000000000060448201526064016103aa565b606860008281526020019081526020016000206040518060a001604052908160008201548152602001600182018054611260906120be565b80601f016020809104026020016040519081016040528092919081815260200182805461128c906120be565b80156112d95780601f106112ae576101008083540402835291602001916112d9565b820191906000526020600020905b8154815290600101906020018083116112bc57829003601f168201915b505050918352505060028201546001600160a01b0316602080830191909152600383018054604080518285028101850182528281529401939283018282801561134157602002820191906000526020600020905b81548152602001906001019080831161132d575b50505091835250506004919091015460ff1615156020909101529392505050565b80600081118015611374575060695481105b8015611392575060008181526068602052604090206004015460ff16155b6113ae5760405162461bcd60e51b81526004016103aa9061212e565b6033546001600160a01b031633146113d85760405162461bcd60e51b81526004016103aa906120f9565b600082815260686020526040812060048101805460ff19166001908117909155018054606691839161140e9190610760906120be565b815260200190815260200160002081905550817f62d16daa2b15fec62c2624e8279f21d75a1e6d3f8dd790378d3129985765cb4a60405160405180910390a25050565b6000600160695461146291906121f6565b905090565b600054610100900460ff1680611480575060005460ff16155b61149c5760405162461bcd60e51b81526004016103aa9061223e565b600054610100900460ff161580156114be576000805461ffff19166101011790555b6114c6611aa9565b606580546001600160a01b0319166001600160a01b0384161790556040805160a0810182526000808252825160208082018552828252830152918101829052906060820190604051908082528060200260200182016040528015611534578160200160208202803683370190505b5081526000602091820181905280526068815281517fad6f8124f6081c2622ab3a16acd47af73d52fe87b755c3f897263c58ba3fdbd790815582820151805191926115a4927fad6f8124f6081c2622ab3a16acd47af73d52fe87b755c3f897263c58ba3fdbd89290910190611cac565b5060408201516002820180546001600160a01b0319166001600160a01b03909216919091179055606082015180516115e6916003840191602090910190611d20565b50608091909101516004909101805460ff191691151591909117905560016069558015611619576000805461ff00191690555b5050565b611625611bee565b606860008381526020019081526020016000206040518060a00160405290816000820154815260200160018201805461165d906120be565b80601f0160208091040260200160405190810160405280929190818152602001828054611689906120be565b80156116d65780601f106116ab576101008083540402835291602001916116d6565b820191906000526020600020905b8154815290600101906020018083116116b957829003601f168201915b505050918352505060028201546001600160a01b0316602080830191909152600383018054604080518285028101850182528281529401939283018282801561173e57602002820191906000526020600020905b81548152602001906001019080831161172a575b50505091835250506004919091015460ff16151560209091015292915050565b6033546001600160a01b031633146117885760405162461bcd60e51b81526004016103aa906120f9565b6001600160a01b0381166117ed5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016103aa565b6117f68161194a565b50565b6033546001600160a01b031633146118235760405162461bcd60e51b81526004016103aa906120f9565b606580546001600160a01b0319166001600160a01b0392909216919091179055565b60008082604051602001611859919061228c565b60408051601f1981840301815291905280516020909101209392505050565b600081815260676020526040902054828114156118d75760405162461bcd60e51b815260206004820152601960248201527f7a4e4120616c7265616479206c696e6b656420746f2044414f0000000000000060448201526064016103aa565b80156118e7576118e7818361199c565b600082815260676020908152604080832086905585835260688252808320600301805460018101825590845291832090910184905551839185917fffdc17a33b6ff8f8f10d88a733ea9fb0db3faa0b4ec1cf8612f81ba96656cd919190a3505050565b603380546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6000828152606860205260408120600381015490915b81811015610d6f57838360030182815481106119d0576119d061220d565b90600052602060002001541415611a9757600383016119f06001846121f6565b81548110611a0057611a0061220d565b9060005260206000200154836003018281548110611a2057611a2061220d565b60009182526020909120015560038301805480611a3f57611a3f6122a8565b60008281526020808220830160001990810183905590920190925585825260679052604080822082905551859187917ffa997975b6b7327afbe399fcdbc2861d51d0d52e5828cf7e1c8a98cd0cadb7ae9190a3610d6f565b80611aa181612223565b9150506119b2565b600054610100900460ff1680611ac2575060005460ff16155b611ade5760405162461bcd60e51b81526004016103aa9061223e565b600054610100900460ff16158015611b00576000805461ffff19166101011790555b611b08611b24565b611b10611b8e565b80156117f6576000805461ff001916905550565b600054610100900460ff1680611b3d575060005460ff16155b611b595760405162461bcd60e51b81526004016103aa9061223e565b600054610100900460ff16158015611b10576000805461ffff191661010117905580156117f6576000805461ff001916905550565b600054610100900460ff1680611ba7575060005460ff16155b611bc35760405162461bcd60e51b81526004016103aa9061223e565b600054610100900460ff16158015611be5576000805461ffff19166101011790555b611b103361194a565b6040518060a00160405280600081526020016060815260200160006001600160a01b03168152602001606081526020016000151581525090565b828054611c34906120be565b90600052602060002090601f016020900481019282611c565760008555611c9c565b82601f10611c6f5782800160ff19823516178555611c9c565b82800160010185558215611c9c579182015b82811115611c9c578235825591602001919060010190611c81565b50611ca8929150611d5a565b5090565b828054611cb8906120be565b90600052602060002090601f016020900481019282611cda5760008555611c9c565b82601f10611cf357805160ff1916838001178555611c9c565b82800160010185558215611c9c579182015b82811115611c9c578251825591602001919060010190611d05565b828054828255906000526020600020908101928215611c9c5791602002820182811115611c9c578251825591602001919060010190611d05565b5b80821115611ca85760008155600101611d5b565b60008083601f840112611d8157600080fd5b50813567ffffffffffffffff811115611d9957600080fd5b602083019150836020828501011115611db157600080fd5b9250929050565b60008060208385031215611dcb57600080fd5b823567ffffffffffffffff811115611de257600080fd5b611dee85828601611d6f565b90969095509350505050565b60005b83811015611e15578181015183820152602001611dfd565b83811115610bfa5750506000910152565b60008151808452611e3e816020860160208601611dfa565b601f01601f19169290920160200192915050565b80518252600060208083015160a082860152611e7160a0860182611e26565b6040858101516001600160a01b03169087015260608086015187830391880191909152805180835290840192506000918401905b80831015611ec55783518252928401926001929092019190840190611ea5565b5060808601519350611edb608088018515159052565b9695505050505050565b602081526000611ef86020830184611e52565b9392505050565b60008060408385031215611f1257600080fd5b50508035926020909101359150565b600060208284031215611f3357600080fd5b5035919050565b848152608060208201526000611f536080830186611e26565b6001600160a01b039490941660408301525090151560609091015292915050565b6001600160a01b03811681146117f657600080fd5b60008060008060608587031215611f9f57600080fd5b84359350602085013567ffffffffffffffff811115611fbd57600080fd5b611fc987828801611d6f565b9094509250506040850135611fdd81611f74565b939692955090935050565b600080600060408486031215611ffd57600080fd5b833567ffffffffffffffff81111561201457600080fd5b61202086828701611d6f565b909450925050602084013561203481611f74565b809150509250925092565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b8281101561209457603f19888603018452612082858351611e52565b94509285019290850190600101612066565b5092979650505050505050565b6000602082840312156120b357600080fd5b8135611ef881611f74565b600181811c908216806120d257607f821691505b602082108114156120f357634e487b7160e01b600052602260045260246000fd5b50919050565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b6020808252600c908201526b496e76616c6964207a44414f60a01b604082015260600190565b6040815282604082015282846060830137600060608483018101919091526001600160a01b03929092166020820152601f909201601f191690910101919050565b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600082198211156121d4576121d46121ab565b500190565b6000602082840312156121eb57600080fd5b8151611ef881611f74565b600082821015612208576122086121ab565b500390565b634e487b7160e01b600052603260045260246000fd5b6000600019821415612237576122376121ab565b5060010190565b6020808252602e908201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160408201526d191e481a5b9a5d1a585b1a5e995960921b606082015260800190565b6000825161229e818460208701611dfa565b9190910192915050565b634e487b7160e01b600052603160045260246000fdfea2646970667358221220c1061f04413be28ea39741aa2ce892daf68bf95474f6f01256901007428239cd64736f6c63430008090033";

type ZDAORegistryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ZDAORegistryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ZDAORegistry__factory extends ContractFactory {
  constructor(...args: ZDAORegistryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
    this.contractName = "ZDAORegistry";
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ZDAORegistry> {
    return super.deploy(overrides || {}) as Promise<ZDAORegistry>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ZDAORegistry {
    return super.attach(address) as ZDAORegistry;
  }
  connect(signer: Signer): ZDAORegistry__factory {
    return super.connect(signer) as ZDAORegistry__factory;
  }
  static readonly contractName: "ZDAORegistry";
  public readonly contractName: "ZDAORegistry";
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ZDAORegistryInterface {
    return new utils.Interface(_abi) as ZDAORegistryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ZDAORegistry {
    return new Contract(address, _abi, signerOrProvider) as ZDAORegistry;
  }
}
