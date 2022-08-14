import { BigNumber, ethers } from 'ethers';
import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { cloneDeep } from 'lodash';

import { PlatformType, ProposalId, zDAOId } from '..';

export const graphQLQuery = async (
  graphQLClient: GraphQLClient,
  query: RequestDocument,
  variables?: Variables,
  path = ''
) => {
  const response = await graphQLClient.request(query, variables);

  return cloneDeep(!path ? response : response[path]);
};

export const generateProposalHash = (
  platformType: PlatformType,
  zDAOId: string,
  proposalId: string
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
  zDAOId: zDAOId
): string => {
  return `${Number(platformType).toFixed(1)}-${Number(zDAOId).toFixed(1)}`;
};

export const generateProposalId = (
  platformType: PlatformType,
  zDAOId: zDAOId,
  proposalId: ProposalId
): string => {
  return `${Number(platformType).toFixed(1)}-${Number(zDAOId).toFixed(
    1
  )}-${proposalId}`;
};
