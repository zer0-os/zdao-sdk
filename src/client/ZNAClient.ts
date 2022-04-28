import {
  Config as zNSConfig,
  createInstance as createZNSInstance,
  Domain,
  domains,
  Instance as zNSInstance,
} from '@zero-tech/zns-sdk';

// import * as zns from '@zero-tech/zns-sdk';
import { zNA, zNAId } from '../types';

class ZNAClient {
  private static _initialized = false;
  private static _znsInstance: zNSInstance;

  static initialize(config: zNSConfig) {
    ZNAClient._znsInstance = createZNSInstance(config);
    ZNAClient._initialized = true;
  }

  static async zNAIdTozNA(zNAId: zNAId): Promise<zNA> {
    return ZNAClient._znsInstance
      .getDomainById(zNAId)
      .then((domain: Domain) => domain.name);
  }

  static zNATozNAId(zNA: zNA): zNAId {
    return domains.domainNameToId(zNA);
  }
}

export default ZNAClient;
