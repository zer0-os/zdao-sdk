import { ethers } from 'ethers';

import ERC20Abi from '../config/constants/abi/ERC20.json';
import ERC721Abi from '../config/constants/abi/ERC721.json';
import { Token } from '../types';
import { errorMessageForError } from './messages';

export const getToken = async (
  provider: ethers.providers.Provider,
  token: string
): Promise<Token> => {
  try {
    const contract = new ethers.Contract(token, ERC20Abi, provider);
    const promises: Promise<any>[] = [contract.symbol(), contract.decimals()];
    const results = await Promise.all(promises);

    const symbol = results[0] as string;
    const decimals = results[1] as number;

    return {
      token,
      symbol,
      decimals,
    };
    // eslint-disable-next-line no-empty
  } catch (error) {}
  try {
    const contract = new ethers.Contract(token, ERC721Abi, provider);
    const symbol = await contract.symbol();

    return {
      token,
      symbol,
      decimals: 0,
    };
    // eslint-disable-next-line no-empty
  } catch (error) {}

  throw new Error(errorMessageForError('empty-voting-token'));
};
