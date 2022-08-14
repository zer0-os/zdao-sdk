import SDKInstanceClient from './SDKInstanceClient';
import { SnapshotConfig, SnapshotSDKInstance } from './types';

export * from './config';
export * from './types';

export const createSDKInstance = async (
  config: SnapshotConfig
): Promise<SnapshotSDKInstance> => {
  return await new SDKInstanceClient(config);
};
