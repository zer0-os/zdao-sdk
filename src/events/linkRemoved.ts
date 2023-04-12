import { ethers } from 'ethers';

// Replace this ABI with the ABI of your contract
const contractAbi = [
    'event LinkRemoved(uint256 indexed daoId, uint256 indexed zNA)',
];

export async function readLinkRemovedEvents(contractAddress: string, provider: ethers.providers.Provider) {
    // Create an ethers.js contract object
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);

    // Fetch the latest block number
    const blockNumber = await provider.getBlockNumber();

    // Define the range of blocks to search for the event
    const startBlock = 1000000;//blockNumber - 1000; // Set this according to how far back you want to search
    const endBlock = blockNumber;

    // Read the DAOCreated event data
    const filter = contract.filters.LinkRemoved(null, null);
    const logs = await provider.getLogs({ ...filter, fromBlock: startBlock, toBlock: endBlock });

    // Parse the logs and return the event data
    return logs.map(log => contract.interface.parseLog(log).args);
}