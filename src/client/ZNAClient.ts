import {
  Config as zNSConfig,
  createInstance as createZNSInstance,
  Domain,
  domains,
  Instance as zNSInstance,
} from '@zero-tech/zns-sdk';

import { zNA, zNAId } from '../types';

class ZNAClient {
  private static _znsInstance: zNSInstance;

  static initialize(config: zNSConfig) {
    ZNAClient._znsInstance = createZNSInstance(config);
  }

  static async zNAIdTozNA(zNAId: zNAId): Promise<zNA> {
    // todo, temporary code only for testing on Goerli network
    if (
      zNAId ===
      '0x7445164548beaf364109b55d8948f056d6e4f1fd26aff998c9156b0b05f1641f'
    )
      return Promise.resolve('wilder.wheels');
    if (
      zNAId ===
      '0x79e5bdb3f024a898df02a5472e6fc5373e6a3c5f65317f58223a579d518378df'
    )
      return Promise.resolve('wilder.kicks');
    if (
      zNAId ===
      '0x617b3c878abfceb89eb62b7a24f393569c822946bbc9175c6c65a7d2647c5402'
    )
      return Promise.resolve('wilder.cats');
    if (
      zNAId ===
      '0x857f504928e4b0dc98c5e3c04a033d1adc7bc06b1522da2ef5e412b4d223ce0f'
    )
      return Promise.resolve('wilder.breasts');
    if (
      zNAId ===
      '0xa3c02134232f0ff305f7297f1c6cf4c9db1293d4cbb061fdc19419a80c575f39'
    )
      return Promise.resolve('zdao-sky.eth');
    if (
      zNAId ===
      '0xf281ebd0f3960561d77d80f40f28cc753078dc41d3f2385c3d2e2835405b4d5f'
    )
      return Promise.resolve('joshupgig.eth');

    if (
      zNAId ===
      '0xf0142b0fe9dceca45b0855af027129b798a130146ccfd7d238ce9e151b6feb56'
    )
      return Promise.resolve('dappchain.eth');

    return ZNAClient._znsInstance
      .getDomainById(zNAId)
      .then((domain: Domain) => domain.name);
  }

  static zNATozNAId(zNA: zNA): zNAId {
    // todo, temporary code only for testing on Goerli network
    if (zNA === 'wilder.wheels')
      return '0x7445164548beaf364109b55d8948f056d6e4f1fd26aff998c9156b0b05f1641f';
    if (zNA === 'wilder.kicks')
      return '0x79e5bdb3f024a898df02a5472e6fc5373e6a3c5f65317f58223a579d518378df';
    if (zNA === 'wilder.cats')
      return '0x617b3c878abfceb89eb62b7a24f393569c822946bbc9175c6c65a7d2647c5402';
    if (zNA === 'wilder.breasts')
      return '0x857f504928e4b0dc98c5e3c04a033d1adc7bc06b1522da2ef5e412b4d223ce0f';
    if (zNA === 'dappchain.eth')
      return '0xf0142b0fe9dceca45b0855af027129b798a130146ccfd7d238ce9e151b6feb56';

    return domains.domainNameToId(zNA);
  }
}

export default ZNAClient;
