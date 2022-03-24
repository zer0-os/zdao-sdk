import { Config, SDKInstance } from './types';
import zSDKClient from './zSDKClient';

export * from './config';
export * from './types';

export const createSDKInstance = (config: Config): SDKInstance => {
  return new zSDKClient(config);
};
