import { SDKInstance } from '../types';
import SDKInstanceClient from './SDKInstanceClient';
import { Config } from './types';

export * from './config';
export * from './types';

export const createSDKInstance = (config: Config): SDKInstance => {
  return new SDKInstanceClient(config);
};
