import { GraphQLClient } from 'graphql-request';
import { getSdk } from './graphql-request-sdk.js';

export function runExampleQuery(x: number, y: number) {
  const client = new GraphQLClient('http://localhost:4000/graphql');
  const sdk = getSdk(client);
  return sdk.Add({ x, y });
}
