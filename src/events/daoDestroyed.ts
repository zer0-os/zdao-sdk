import { ethers } from 'ethers';

const contractAbi = [
    'event DAODestroyed(uint256 indexed daoId)',
];

export async function readDAODestroyedEvents(contract: ethers.Contract) {
    // Fetch the latest block number
    const blockNumber = await contract.provider.getBlockNumber();

    // Define the range of blocks to search for the event
    const startBlock = 1000000;//blockNumber - 1000; // Set this according to how far back you want to search
    const endBlock = blockNumber;

    // Read the DAOCreated event data
    const filter = contract.filters.DAODestroyed();
    const logs = await contract.provider.getLogs({ ...filter, fromBlock: startBlock, toBlock: endBlock });

    // Parse the logs and return the event data
    return logs.map(log => contract.interface.parseLog(log).args);
}