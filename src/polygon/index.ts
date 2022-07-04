import SDKInstanceClient from './SDKInstanceClient';
import { PolygonConfig, PolygonSDKInstance } from './types';

export * from './config';
export * from './types';

export const createSDKInstance = async (
  config: PolygonConfig
): Promise<PolygonSDKInstance> => {
  return await new SDKInstanceClient(config);
};
