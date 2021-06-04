import { createApi } from '@reduxjs/toolkit/query/react';
import { graphqlRequestBaseQuery } from '../src';

export const api = createApi({
  baseQuery: graphqlRequestBaseQuery({
    url: '/graphql',
  }),
  endpoints: () => ({}),
});
