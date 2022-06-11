import { BaseConfig } from '../../types';

export interface SnapshotConfig {
  // uri to Snaphost Hub
  serviceUri: string;

  // chain id as string where space created
  network: string;
}

export interface Config extends BaseConfig {
  // snapshot.org configuration
  snapshot: SnapshotConfig;
}
