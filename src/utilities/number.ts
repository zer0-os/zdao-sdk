import { ethers } from 'ethers';

export const BIG_TEN = ethers.BigNumber.from(10);
export const BIG_EITEEN = ethers.BigNumber.from(10).pow(18);
export const DECIMALS = 4;

export const extendToDecimals = (decimals = 18): ethers.BigNumber => {
  return ethers.BigNumber.from(10).pow(decimals);
};

export const getFullDisplayBalance = (
  balance: ethers.BigNumber,
  decimals = 18,
  displayDecimals?: number
) => {
  return getBalanceAmount(balance, decimals)
    .toNumber()
    .toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: displayDecimals ?? DECIMALS,
    });
};

export const getDecimalAmount = (amount: ethers.BigNumber, decimals = 18) => {
  return extendToDecimals(decimals).mul(amount);
};

export const getBalanceAmount = (amount: ethers.BigNumber, decimals = 18) => {
  return ethers.BigNumber.from(amount).div(BIG_TEN.pow(decimals));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFormatedValue = (value: any) =>
  parseFloat(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: DECIMALS,
  });

export const trimHexString = (hex: string) => {
  return `0x${hex.replace(/^0x0+/g, '')}`;
};
