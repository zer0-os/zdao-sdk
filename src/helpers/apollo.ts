import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client/core';
import gql from 'graphql-tag';

// Create the apollo client
export const createApolloClient = (
  graphqlUri: string
): ApolloClient<NormalizedCacheObject> => {
  const apolloClient = new ApolloClient({
    link: createHttpLink({ uri: graphqlUri }),
    cache: new InMemoryCache({ addTypename: false }),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
      },
    },
    typeDefs: gql`
      enum OrderDirection {
        asc
        desc
      }
    `,
  });

  return apolloClient;
};
