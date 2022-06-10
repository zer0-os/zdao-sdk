import { SDKInstance } from '../types';
import SDKInstanceClient from './SDKInstanceClient';
import { Config } from './types';

export { ZNAClient } from './client';
export * from './config';
export * from './types';

export const createSDKInstance = async (
  config: Config
): Promise<SDKInstance> => {
  return await new SDKInstanceClient(config);
};
