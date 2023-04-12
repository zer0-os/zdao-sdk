import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';

import { zNA } from '../types';
import { getActiveLinks } from './activeLinks';

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
    }
];

export async function getZDAOByZNA(zna: zNA, contractAddress: string, provider: ethers.providers.Provider) {
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

    //const links = await getActiveLinks(contractAddress, provider);

    const zDAO = await contract.getzDaoByZNA(zna);
    console.log('zDAO:', zDAO);

    return zDAO;
}