import { ethers } from 'ethers';

import ERC20Abi from '../config/abi/ERC20.json';
import { Token } from '../types';

export const getToken = async (
  provider: ethers.providers.Provider,
  token: string
): Promise<Token> => {
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
};
