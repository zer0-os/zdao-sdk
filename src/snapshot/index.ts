import { BaseConfig, SDKInstance } from '../types';
import SDKInstanceClient from './SDKInstanceClient';
import { Config } from './types';

export * from './config';
export * from './types';

export const createSDKInstance = (config: BaseConfig): Promise<SDKInstance> => {
  return Promise.resolve(new SDKInstanceClient(config as Config));
};
