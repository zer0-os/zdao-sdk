import { Config } from '../../types';

export interface SnapshotNetworkConfig {
  // uri to Snapshot Hub
  serviceUri: string;

  // chain id as string where space created
  network: string;
}

export interface SnapshotConfig extends Config {
  // snapshot.org configuration
  snapshot: SnapshotNetworkConfig;
}
