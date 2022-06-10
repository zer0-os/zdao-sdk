// import { SDKInstance } from './types';

import { createSDKInstance as _createPolygonSDKInstance } from './polygon';
import { createSDKInstance as _createSnapshotSDKInstance } from './snapshot';

export enum PlatformType {
  Snapshot = 'Snapshot',
  Polygon = 'Polygon',
  StarkNet = 'StarkNet',
}

export const createSDKInstanceBuilder = (platformType: PlatformType) => {
  return platformType === PlatformType.Snapshot
    ? _createSnapshotSDKInstance
    : _createPolygonSDKInstance;
};
