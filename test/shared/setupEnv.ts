import * as dotenv from 'dotenv';

import { SupportedChainId } from '../../src/types';

dotenv.config();

export const setEnv = () => {
  const rpcUrl = process.env.INFURA_URL ?? '';
  const network =
    (Number(process.env.INFURA_NETWORK) as SupportedChainId) ??
    SupportedChainId.RINKEBY;
  const zDAOCore = process.env.ZDAO_CORE ?? '';

  return {
    rpcUrl,
    network,
    zDAOCore,
  };
};
