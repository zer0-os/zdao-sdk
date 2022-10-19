import { BigNumber } from '@ethersproject/bignumber';

export const BIG_TEN = BigNumber.from(10);
export const BIG_EITEEN = BigNumber.from(10).pow(18);
export const DECIMALS = 4;

export const extendToDecimals = (decimals = 18): BigNumber => {
  return BigNumber.from(10).pow(decimals);
};

export const getFullDisplayBalance = (
  balance: BigNumber,
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

export const getDecimalAmount = (amount: BigNumber, decimals = 18) => {
  return extendToDecimals(decimals).mul(amount);
};

export const getBalanceAmount = (amount: BigNumber, decimals = 18) => {
  return BigNumber.from(amount).div(BIG_TEN.pow(decimals));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFormatedValue = (value: any) =>
  parseFloat(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: DECIMALS,
  });
