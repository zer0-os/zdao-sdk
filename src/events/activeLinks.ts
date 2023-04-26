import { ethers } from 'ethers';
import { readLinkAddedEvents } from './linkAdded';
import { readLinkRemovedEvents } from './linkRemoved';

export async function getActiveLinks(contract: ethers.Contract) {
    // Read the LinkAdded and LinkRemoved events
    const linkAddedEvents = await readLinkAddedEvents(contract);
    const linkRemovedEvents = await readLinkRemovedEvents(contract);

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