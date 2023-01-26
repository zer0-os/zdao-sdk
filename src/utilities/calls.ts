import { Signer } from '@ethersproject/abstract-signer';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Provider, Web3Provider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';

import ERC20Abi from '../config/abi/ERC20.json';
import ERC721Abi from '../config/abi/ERC721.json';
import { Token } from '../types';
import { errorMessageForError } from './messages';

export const getSigner = (
  provider: Web3Provider | Wallet,
  account: string | undefined
): Signer => {
  if (provider instanceof Wallet) {
    return provider;
  }
  if (!account) {
    throw new Error(errorMessageForError('invalid-signer'));
  }
  return provider.getSigner(account).connectUnchecked();
};

export const getToken = async (
  provider: Provider,
  token: string
): Promise<Token> => {
  try {
    const contract = new Contract(token, ERC20Abi, provider);
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
  } catch (error: any) {}
  try {
    const contract = new Contract(token, ERC721Abi, provider);
    const symbol = await contract.symbol();

    return {
      token,
      symbol,
      decimals: 0,
    };
    // eslint-disable-next-line no-empty
  } catch (error: any) {}

  throw new Error(errorMessageForError('invalid-token'));
};

export const getTotalSupply = async (
  provider: Provider,
  token: string
): Promise<BigNumber> => {
  try {
    const contract = new Contract(token, ERC20Abi, provider);
    const totalSupply = await contract.totalSupply();
    return totalSupply;
  } catch (error: any) {
    throw new Error(
      errorMessageForError('network-error', {
        message: error.message ?? error.error_description,
      })
    );
  }
};
