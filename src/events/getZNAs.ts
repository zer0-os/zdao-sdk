import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import { getActiveLinks } from './activeLinks';
import { zNAAssociation } from '../types';

export async function getZNAs(contract: ethers.Contract) {

    const links = await getActiveLinks(contract);

    const associations: zNAAssociation[] = links.map((item) => ({
        id: BigNumber.from(item.zNA).toHexString(),
    }));
    return associations;
}