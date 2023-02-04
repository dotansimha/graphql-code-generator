/* eslint-disable no-console */
import { promises } from 'node:fs';
import { codegen } from '@graphql-codegen/core';
import { getCachedDocumentNodeFromSchema } from '@graphql-codegen/plugin-helpers';
import * as typedDocumentNode from '@graphql-codegen/typed-document-node';
import * as typescript from '@graphql-codegen/typescript';
import * as typescriptOperations from '@graphql-codegen/typescript-operations';
import * as typescriptResolvers from '@graphql-codegen/typescript-resolvers';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadDocuments } from '@graphql-tools/load';
import { makeExecutableSchema } from '@graphql-tools/schema';
import gql from 'graphql-tag';
import prettier from 'prettier';
import type { Resolvers } from './gql.generated.js';

const schema = makeExecutableSchema({
  typeDefs: gql`
    type Query {
      hello: String!
    }
  `,
  resolvers: {
    Query: {
      hello(_root, _args, _ctx) {
        return 'world';
      },
    },
  } as Resolvers<unknown>,
});

(async () => {
  const loadedDocuments = await loadDocuments(['src/graphql/**/*.gql'], {
    loaders: [new GraphQLFileLoader()],
  });

  const config: typescript.TypeScriptPluginConfig &
    typescriptResolvers.TypeScriptResolversPluginConfig &
    typescriptOperations.TypeScriptDocumentsPluginConfig &
    typedDocumentNode.TypeScriptTypedDocumentNodesConfig = {
    useTypeImports: true,
  };

  const schemaAsDocumentNode = getCachedDocumentNodeFromSchema(schema);

  const codegenCode = await codegen({
    schema: schemaAsDocumentNode,
    schemaAst: schema,
    config,
    documents: loadedDocuments,
    filename: 'gql.generated.ts',
    pluginMap: {
      typescript,
      typescriptResolvers,
      typescriptOperations,
      typedDocumentNode,
    },
    plugins: [
      {
        typescript: {},
      },
      {
        typescriptResolvers: {},
      },
      {
        typescriptOperations: {},
      },
      {
        typedDocumentNode: {},
      },
    ],
  });

  await promises.writeFile(
    'src/gql.generated.ts',
    prettier.format(codegenCode, {
      ...(await prettier.resolveConfig(process.cwd())),
      parser: 'typescript',
    }),
    'utf8'
  );
  console.log('done generating.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
