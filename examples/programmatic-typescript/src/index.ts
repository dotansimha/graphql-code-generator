import Fastify from 'fastify';
import { promises } from 'fs';
import { parse, printSchema } from 'graphql';

import { codegen } from '@graphql-codegen/core';
import * as typedDocumentNode from '@graphql-codegen/typed-document-node';
import * as typescript from '@graphql-codegen/typescript';
import * as typescriptOperations from '@graphql-codegen/typescript-operations';
import * as typescriptResolvers from '@graphql-codegen/typescript-resolvers';
import { CreateApp, gql, EZContext } from '@graphql-ez/fastify';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadDocuments } from '@graphql-tools/load';
import prettier from 'prettier';

import type { Resolvers } from './ez.generated';

declare module '@graphql-ez/fastify' {
  interface EZResolvers extends Resolvers<EZContext> {}
}

const { writeFile } = promises;

const server = Fastify({
  logger: true,
});

const ezApp = CreateApp({
  schema: {
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
    },
  },
});

const { fastifyPlugin, getEnveloped } = ezApp.buildApp();

server.register(fastifyPlugin);

(async () => {
  const { schema } = (await getEnveloped)();

  const loadedDocuments = await loadDocuments(['src/graphql/**/*.gql'], {
    loaders: [new GraphQLFileLoader()],
  });

  const config: typescript.TypeScriptPluginConfig &
    typescriptResolvers.TypeScriptResolversPluginConfig &
    typescriptOperations.TypeScriptDocumentsPluginConfig &
    typedDocumentNode.TypeScriptTypedDocumentNodesConfig = {
    useTypeImports: true,
  };

  const codegenCode = await codegen({
    schema: parse(printSchema(schema)),
    config,
    documents: loadedDocuments,
    filename: 'ez.generated.ts',
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

  await writeFile(
    'src/ez.generated.ts',
    prettier.format(codegenCode, {
      ...(await prettier.resolveConfig(process.cwd())),
      parser: 'typescript',
    }),
    {
      encoding: 'utf-8',
    }
  );
})().catch(err => {
  console.error(err);
  process.exit(1);
});

server.listen(8080);
