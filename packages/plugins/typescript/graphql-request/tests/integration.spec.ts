import { codegen } from '@graphql-codegen/core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { parse } from 'graphql';
import * as TypeScriptPlugin from '@graphql-codegen/typescript';
import * as TypeScriptOperationsPlugin from '@graphql-codegen/typescript-operations';
import * as GraphQLRequestPlugin from '../src/index.js';
import { remove, writeFile } from 'fs-extra';
import { join } from 'path';
import { mockGraphQLServer } from '@graphql-codegen/testing';

describe('GraphQL Request Integration', () => {
  it('should send requests correctly', async () => {
    const sdkFileName = 'graphql-request-sdk.ts';
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
        'graphql-request': GraphQLRequestPlugin,
      },
      plugins: [
        {
          typescript: {},
        },
        {
          'typescript-operations': {},
        },
        {
          'graphql-request': {},
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
    const { runExampleQuery } = require('./test-files/run-example-query');
    const queryResult = await runExampleQuery(2, 3);
    expect(queryResult?.add).toBe(5);
    mockServer.done();
    await remove(sdkFilePath);
  });
});
