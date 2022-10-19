import { BigNumber } from '@ethersproject/bignumber';

// add 10%
export const calculateGasMargin = (value: BigNumber): BigNumber => {
  return value
    .mul(BigNumber.from(10000).add(BigNumber.from(1000)))
    .div(BigNumber.from(10000));
};
