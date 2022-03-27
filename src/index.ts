import SDKInstanceClient from './SDKInstanceClient';
import { Config, SDKInstance } from './types';

export * from './config';
export * from './types';

export const createSDKInstance = (config: Config): SDKInstance => {
  return new SDKInstanceClient(config);
};
