import SDKInstanceClient from './SDKInstanceClient';
import { SnapshotConfig, SnapshotSDKInstance } from './types';

export * from './config';
export * from './types';

export const createSDKInstance = (
  config: SnapshotConfig
): Promise<SnapshotSDKInstance> => {
  return Promise.resolve(new SDKInstanceClient(config));
};
