import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { getActiveLinks } from './activeLinks';
import { ZDAORegistry } from '../config/types/ZDAORegistry'

const contractAbi = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "zNA",
                "type": "uint256"
            }
        ],
        "name": "getzDaoByZNA",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "ensSpace",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "gnosisSafe",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "associatedzNAs",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "bool",
                        "name": "destroyed",
                        "type": "bool"
                    }
                ],
                "internalType": "struct ZDAORecord",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "startIndex",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "endIndex",
                "type": "uint256"
            }
        ],
        "name": "listzDAOs",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "ensSpace",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "gnosisSafe",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256[]",
                        "name": "associatedzNAs",
                        "type": "uint256[]"
                    },
                    {
                        "internalType": "bool",
                        "name": "destroyed",
                        "type": "bool"
                    }
                ],
                "internalType": "struct ZDAORecord[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export async function getZDAORecords(contractAddress: string, provider: ethers.providers.Provider) {
    interface ZNA {
        id: string;
    }

    interface ZDAORecord {
        id: string;
        zDAOId: number;
        createdBy: string;
        destroyed: boolean;
        gnosisSafe: string;
        name: string;
        platformType: number;
        zNAs: ZNA[];
    }

    // Create an ethers.js contract object
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);

    const links = await getActiveLinks(contractAddress, provider);

    const zDAOList = await contract.listzDAOs(1, links.length); //unsure if this from-to is correct
    console.log('List of ZDAORecords:', zDAOList);

    return zDAOList;
}