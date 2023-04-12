import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { getActiveLinks } from './activeLinks';

export async function getZNAs(contractAddress: string, provider: ethers.providers.Provider) {
    type Association = {
        id: string;
    };
    const links = await getActiveLinks(contractAddress, provider);

    const associations: Association[] = links.map((item: any) => ({
        id: BigNumber.from(item.zNA).toHexString(),
    }));
    return associations;
}