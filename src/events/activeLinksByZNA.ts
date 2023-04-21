import { ethers } from 'ethers';
import { readLinkAddedEventsByZNA } from './linkAddedByZNA';
import { readLinkRemovedEventsByZNA } from './linkRemovedByZNA';

export async function getActiveLinksByZNA(contract: ethers.Contract, zNA: ethers.BigNumber) {
    // Read the LinkAdded and LinkRemoved events
    const linkAddedEvents = await readLinkAddedEventsByZNA(contract, zNA);
    const linkRemovedEvents = await readLinkRemovedEventsByZNA(contract, zNA);

    // Create a set of removed links for faster lookups
    const removedLinksSet = new Set(
        linkRemovedEvents.map(event => event.daoId.toString() + '-' + event.zNA.toString())
    );

    // Filter out the added links that have not been removed
    const activeLinks = linkAddedEvents.filter(
        event => !removedLinksSet.has(event.daoId.toString() + '-' + event.zNA.toString())
    );

    return activeLinks;
}