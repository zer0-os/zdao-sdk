import { ethers } from 'ethers';

const contractAbi = [
    'event DAOCreated(uint256 indexed daoId, string ensSpace, address gnosisSafe)',
];

export async function readDAOCreatedEvents(contractAddress: string, provider: ethers.providers.Provider) {
    // Create an ethers.js contract object
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);

    // Fetch the latest block number
    const blockNumber = await provider.getBlockNumber();

    // Define the range of blocks to search for the event
    const startBlock = blockNumber - 1000; // Set this according to how far back you want to search
    const endBlock = blockNumber;

    // Read the DAOCreated event data
    const filter = contract.filters.DAOCreated();
    const logs = await provider.getLogs({ ...filter, fromBlock: startBlock, toBlock: endBlock });

    // Parse the logs and return the event data
    return logs.map(log => contract.interface.parseLog(log).args);
}