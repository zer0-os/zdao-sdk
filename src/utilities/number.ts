import { formatUnits } from '@ethersproject/units';

export const DECIMALS = 4;

export const getFullDisplayBalance = (
  balance: string,
  decimals = 18,
  displayDecimals?: number
) => {
  return Number(formatUnits(balance, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: displayDecimals ?? DECIMALS,
  });
};
