import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '../src';
import { GraphQLClient } from 'graphql-request';

export const client = new GraphQLClient('/graphql');

export const api = createApi({
  baseQuery: graphqlRequestBaseQuery({ client }),
  endpoints: () => ({}),
});
