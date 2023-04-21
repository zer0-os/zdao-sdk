import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { getActiveLinks } from './activeLinks';

export async function getZNAs(contract: ethers.Contract) {
    type Association = {
        id: string;
    };
    const links = await getActiveLinks(contract);

    const associations: Association[] = links.map((item: any) => ({
        id: BigNumber.from(item.zNA).toHexString(),
    }));
    return associations;
}