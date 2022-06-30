import SDKInstanceClient from './SDKInstanceClient';
import { Config, SDKInstance } from './types';

export * from './config';
export * from './types';

export const createSDKInstance = (config: Config): Promise<SDKInstance> => {
  return Promise.resolve(new SDKInstanceClient(config as Config));
};
