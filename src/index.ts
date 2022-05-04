import SDKInstanceClient from './SDKInstanceClient';
import { Config, SDKInstance } from './types';

export * from './config';
export * from './types';

export const createSDKInstance = async (
  config: Config
): Promise<SDKInstance> => {
  return await new SDKInstanceClient(config);
};
