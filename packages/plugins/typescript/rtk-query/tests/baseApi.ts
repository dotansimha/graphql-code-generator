import { BaseQueryFn, createApi } from '@reduxjs/toolkit/query/react';
import { request } from 'graphql-request';

const graphqlBaseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: '' }): BaseQueryFn<any, unknown, any> =>
  async ({ body, variables }) => {
    const result = await request(baseUrl, body, variables);
    return { data: result };
  };

export const api = createApi({
  baseQuery: graphqlBaseQuery({
    baseUrl: '/graphql',
  }),
  endpoints: () => ({}),
});
