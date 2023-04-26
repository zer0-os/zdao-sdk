import { ethers } from 'ethers';

export async function readLinkRemovedEvents(contract: ethers.Contract) {
    // Fetch the latest block number
    const blockNumber = await contract.provider.getBlockNumber();

    // Define the range of blocks to search for the event
    const startBlock = 14526282 //Mainnet zDAOregistry deployed at this block
    const endBlock = blockNumber;

    // Read the DAOCreated event data
    const filter = contract.filters.LinkRemoved(null, null);
    const logs = await contract.provider.getLogs({ ...filter, fromBlock: startBlock, toBlock: endBlock });

    // Parse the logs and return the event data
    return logs.map(log => contract.interface.parseLog(log).args);
}