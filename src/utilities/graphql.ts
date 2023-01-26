import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { cloneDeep } from 'lodash';

import { errorMessageForError } from './messages';

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
    throw new Error(
      errorMessageForError('network-error', {
        message: error.message ?? error.error_description,
      })
    );
  }
};
