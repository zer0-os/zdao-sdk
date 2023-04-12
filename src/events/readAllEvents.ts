import { ethers } from 'ethers';

// Replace this ABI with the ABI of your contract
const contractAbi = [
    'event DAOCreated(uint256 indexed daoId, string ensSpace, address gnosisSafe)',
    'event DAOModified(uint256 indexed daoId, string ensSpace, address gnosisSafe)',
    'event DAODestroyed(uint256 indexed daoId)',
    'event LinkAdded(uint256 indexed daoId, uint256 indexed zNA)',
    'event LinkRemoved(uint256 indexed daoId, uint256 indexed zNA)',
];

export async function readAllEvents(
    contractAddress: string,
    provider: ethers.providers.Provider
) {
    // Create an ethers.js contract object
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);

    // Fetch the latest block number
    const blockNumber = await provider.getBlockNumber();

    // Define the range of blocks to search for the event
    const startBlock = 0;//blockNumber - 1000; // Set this according to how far back you want to search
    const endBlock = blockNumber;

    // Read all events
    const eventNames = [
        'DAOCreated',
        'DAOModified',
        'DAODestroyed',
        'LinkAdded',
        'LinkRemoved',
    ];

    const events = await Promise.all(
        eventNames.map(async eventName => {
            const filter = contract.filters[eventName]();
            const logs = await provider.getLogs({ ...filter, fromBlock: startBlock, toBlock: endBlock });

            // Parse the logs and return the event data
            return logs.map(log => {
                const parsed = contract.interface.parseLog(log);
                return {
                    eventName: parsed.name,
                    eventData: parsed.args,
                };
            });
        })
    );

    // Flatten the events array and return
    return events.flat();
}