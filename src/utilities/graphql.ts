import { BigNumber, ethers } from 'ethers';
import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { cloneDeep } from 'lodash';

import { PlatformType, ProposalId, zDAOId } from '..';
import { NetworkError } from '../types';

export const graphQLQuery = async (
  graphQLClient: GraphQLClient,
  query: RequestDocument,
  variables?: Variables,
  path = ''
) => {
  try {
    const response = await graphQLClient.request(query, variables);

    return cloneDeep(!path ? response : response[path]);
  } catch (error: any) {
    throw new NetworkError(error.message);
  }
};

export const generateProposalHash = (
  platformType: PlatformType,
  zDAOId: string,
  proposalId: string // proposalId: toHexString(), 0x1, 0x2 ...
): BigNumber => {
  return BigNumber.from(
    ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['uint256', 'string', 'string'],
        [platformType, zDAOId, proposalId]
      )
    )
  );
};

export const generateZDAOId = (
  platformType: PlatformType,
  zDAOId: zDAOId // zDAOId: string number
): string => {
  // platformType: PlatformType.Polygon
  // zDAOId: 1
  // expected return: 1.0-1.0
  return `${Number(platformType).toFixed(1)}-${Number(zDAOId).toFixed(1)}`;
};

export const generateProposalId = (
  platformType: PlatformType,
  zDAOId: zDAOId,
  proposalId: ProposalId // proposalId: toHexString(), 0x1, 0x2 ...
): string => {
  // platformType: PlatformType.Polygon
  // zDAOId: 1
  // proposalId: 0x
  // expected return: 1.0-1.0-0x1
  return `${Number(platformType).toFixed(1)}-${Number(zDAOId).toFixed(
    1
  )}-${proposalId}`;
};

export const validateAddress = (address: string) => {
  if (address === '0x00000000') {
    // 0x00000000 == Address(0) in subgraph
    return ethers.constants.AddressZero;
  }
  return ethers.utils.getAddress(address);
};
