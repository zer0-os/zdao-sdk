// import namehash from '@ensdomains/eth-ens-namehash';
import * as zns from '@zero-tech/zns-sdk';

import { zNA } from '../types';

export const zNATozNAId = (domain: zNA): string => {
  return zns.domains.domainNameToId(domain);
};

// export const ensToensId = (domain: string): string => {
//   return namehash.hash(domain);
// };
