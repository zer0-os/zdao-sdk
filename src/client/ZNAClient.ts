import {
  Config as zNSConfig,
  createInstance as createZNSInstance,
  Domain,
  domains,
  Instance as zNSInstance,
} from '@zero-tech/zns-sdk';

import { zNA, zNAId } from '../types';
import { errorMessageForError } from '../utilities';

class ZNAClient {
  private static znsInstance: zNSInstance;

  static initialize(config: zNSConfig) {
    ZNAClient.znsInstance = createZNSInstance(config);
  }

  static async zNAIdTozNA(zNAId: zNAId): Promise<zNA> {
    try {
      return await ZNAClient.znsInstance
        .getDomainById(zNAId)
        .then((domain: Domain) => domain.name);
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message,
        })
      );
    }
  }

  static zNATozNAId(zNA: zNA): zNAId {
    try {
      return domains.domainNameToId(zNA);
    } catch (error: any) {
      throw new Error(
        errorMessageForError('network-error', {
          message: error.message,
        })
      );
    }
  }
}

export default ZNAClient;
