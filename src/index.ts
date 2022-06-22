import { createSDKInstance as _createPolygonSDKInstance } from './polygon';
import { createSDKInstance as _createSnapshotSDKInstance } from './snapshot';
import { BaseConfig, SDKInstance } from './types';

export * as Polygon from './polygon';
export * as Snapshot from './snapshot';
export * from './types';

export enum PlatformType {
  Snapshot = 0,
  Polygon = 1,
  StarkNet = 2,
}

export const createSDKInstanceBuilder = (
  platformType: PlatformType
): ((config: BaseConfig) => Promise<SDKInstance>) => {
  return platformType === PlatformType.Snapshot
    ? _createSnapshotSDKInstance
    : _createPolygonSDKInstance;
};
