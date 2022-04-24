import { codegen } from '@graphql-codegen/core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { parse } from 'graphql';
import * as TypeScriptPlugin from '@graphql-codegen/typescript';
import * as TypeScriptOperationsPlugin from '@graphql-codegen/typescript-operations';
import * as GraphQLUrqlPlugin from '../src';
import { remove, writeFile } from 'fs-extra';
import { join } from 'path';
import { mockGraphQLServer } from '@graphql-codegen/testing';
import { Client } from '@urql/core';
import { fetch } from 'cross-fetch';

describe('GraphQL Request Integration', () => {
  it('should send requests correctly', async () => {
    const sdkFileName = 'typescript-urql-sdk.ts';
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
        'typescript-urql-sdk': GraphQLUrqlPlugin,
      },
      plugins: [
        {
          typescript: {},
        },
        {
          'typescript-operations': {},
        },
        {
          'typescript-urql-sdk': {},
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
    const { getSdk } = await import('./test-files/typescript-urql-sdk');
    const client = new Client({
      url: 'http://localhost:4000/graphql',
      fetch,
      // cache: new InMemoryCache(),
      // link: new HttpLink({ uri: 'http://localhost:4000/graphql', fetch }),
    });
    const queryResult = await getSdk(client).add({ x: 2, y: 3 }).toPromise();
    expect(queryResult.data.add).toBe(5);
    mockServer.done();
    await remove(sdkFilePath);
  });
});
