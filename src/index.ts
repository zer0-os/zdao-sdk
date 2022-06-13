import { createSDKInstance as _createPolygonSDKInstance } from './polygon';
import { createSDKInstance as _createSnapshotSDKInstance } from './snapshot';

export enum PlatformType {
  Snapshot = 0,
  Polygon = 1,
  StarkNet = 2,
}

export const createSDKInstanceBuilder = (platformType: PlatformType) => {
  return platformType === PlatformType.Snapshot
    ? _createSnapshotSDKInstance
    : _createPolygonSDKInstance;
};
