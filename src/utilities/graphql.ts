import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { cloneDeep } from 'lodash';

export const graphQLQuery = async (
  graphQLClient: GraphQLClient,
  query: RequestDocument,
  variables?: Variables,
  path = ''
) => {
  const response = await graphQLClient.request(query, variables);

  return cloneDeep(!path ? response : response[path]);
};
