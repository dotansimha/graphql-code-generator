import { BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { DocumentNode } from 'graphql';
import { GraphQLClient, ClientError } from 'graphql-request';

type P = Parameters<GraphQLClient['request']>;
export type Document = P[0];
export type Variables = P[1];
export type RequestHeaders = P[2];

export const graphqlRequestBaseQuery = (
  options: { url: string; requestHeaders?: RequestHeaders } | { client: GraphQLClient }
): BaseQueryFn<{ document: string | DocumentNode; variables: any }, unknown, ClientError> => {
  const client = 'client' in options ? options.client : new GraphQLClient(options.url);
  if ('requestHeaders' in options) {
    client.setHeaders(options.requestHeaders);
  }
  return async ({ document, variables }) => {
    try {
      return { data: await client.request(document, variables) };
    } catch (error) {
      if (error instanceof ClientError) {
        return { error };
      }
      throw error;
    }
  };
};
