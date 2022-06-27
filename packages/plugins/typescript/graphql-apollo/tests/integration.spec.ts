import { codegen } from '@graphql-codegen/core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { parse } from 'graphql';
import * as TypeScriptPlugin from '@graphql-codegen/typescript';
import * as TypeScriptOperationsPlugin from '@graphql-codegen/typescript-operations';
import * as GraphQLApolloPlugin from '../src/index.js';
import { remove, writeFile } from 'fs-extra';
import { join } from 'path';
import { mockGraphQLServer } from '@graphql-codegen/testing';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { fetch } from 'cross-fetch';

describe('GraphQL Request Integration', () => {
  it.skip('should send requests correctly', async () => {
    const sdkFileName = 'graphql-apollo-sdk.ts';
    const sdkFilePath = join(__dirname, './test-files', sdkFileName);
    const typeDefs = parse(/* GraphQL */ `
      type Query {
        add(x: Int!, y: Int!): Int!
      }
    `);
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers: {
        Query: {
          add: (_, { x, y }) => x + y,
        },
      },
    });
    const exampleQuery = /* GraphQL */ `
      query Add($x: Int!, $y: Int!) {
        add(x: $x, y: $y)
      }
    `;
    const sdkCodeString = await codegen({
      schema: typeDefs,
      schemaAst: schema,
      documents: [
        {
          document: parse(exampleQuery),
          rawSDL: exampleQuery,
        },
      ],
      filename: sdkFileName,
      pluginMap: {
        typescript: TypeScriptPlugin,
        'typescript-operations': TypeScriptOperationsPlugin,
        'graphql-apollo': GraphQLApolloPlugin,
      },
      plugins: [
        {
          typescript: {},
        },
        {
          'typescript-operations': {},
        },
        {
          'graphql-apollo': {},
        },
      ],
      config: {},
    });
    await writeFile(sdkFilePath, sdkCodeString, 'utf-8');
    const mockServer = mockGraphQLServer({
      schema,
      host: 'http://localhost:4000',
      path: '/graphql',
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { getSdk } = await import('./test-files/graphql-apollo-sdk');
    const apolloClient = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({ uri: 'http://localhost:4000/graphql', fetch }),
    });
    const queryResult = await getSdk(apolloClient).addQuery({ variables: { x: 2, y: 3 } });
    expect(queryResult.data.add).toBe(5);
    mockServer.done();
    await remove(sdkFilePath);
  });
});
