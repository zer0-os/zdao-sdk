import { Config } from '../../types';

export interface SnapshotNetworkConfig {
  // uri to Snapshot Hub
  serviceUri: string;
}

export interface SnapshotConfig extends Config {
  // snapshot.org configuration
  snapshot: SnapshotNetworkConfig;
}
