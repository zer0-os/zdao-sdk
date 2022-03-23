import { Fragment, Interface, JsonFragment } from '@ethersproject/abi';
import { CallOverrides, Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';

import { MultiCallAddress, SupportedChainId } from '../config';

export interface Call {
  address: string; // Address of the contract
  name: string; // Function name on the contract (example: balanceOf)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[]; // Function params
}

export interface MulticallOptions extends CallOverrides {
  limit?: number; // multicall pagination
}

export const multicall = async <T = any>(
  provider: JsonRpcProvider,
  network: SupportedChainId,
  abi: string | ReadonlyArray<Fragment | JsonFragment | string>,
  calls: Call[],
  options?: MulticallOptions
): Promise<T[]> => {
  const multicallAbi = [
    'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
  ];
  const multi = new Contract(MultiCallAddress[network], multicallAbi, provider);
  const itf = new Interface(abi);
  try {
    const max = options?.limit || 500;
    // multicall pagination
    const pages = Math.ceil(calls.length / max);
    const promises: any = [];
    Array.from(Array(pages)).forEach((x, i) => {
      const callsInPage = calls.slice(max * i, max * (i + 1));
      promises.push(
        multi.aggregate(
          callsInPage.map((call) => [
            call.address.toLowerCase(),
            itf.encodeFunctionData(call.name, call.params),
          ]),
          options || {}
        )
      );
    });
    // wait for promise result
    let results: any = await Promise.all(promises);
    // merge all the results
    results = results.reduce((prev: any, [, res]: any) => prev.concat(res), []);

    // decode result from hex string
    return results.map((call: any, i: number) =>
      itf.decodeFunctionResult(calls[i].name, call)
    );
  } catch (e) {
    return Promise.reject(e);
  }
};
