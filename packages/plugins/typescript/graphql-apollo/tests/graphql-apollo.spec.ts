import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';
import { parse, buildClientSchema, GraphQLSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin, TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations';
import { RawGraphQLApolloPluginConfig } from '../src/config.js';

describe('apollo-client', () => {
  const schema = buildClientSchema(require('../../../../../dev-test/githunt/schema.json'));
  const basicDoc = parse(/* GraphQL */ `
    query feed {
      feed {
        id
        commentCount
        repository {
          owner {
            avatar_url
          }
        }
      }
    }

    subscription ListenToComments($name: String) {
      commentAdded(repoFullName: $name) {
        id
      }
    }

    mutation MutationOperation($comment: Comment!) {
      submitComment(Comment: $comment) {
        id
      }
    }

    query feed2($v: String!) {
      feed {
        id
      }
    }

    query feed3($v: String) {
      feed {
        id
      }
    }

    query feed4($v: String! = "TEST") {
      feed {
        id
      }
    }
  `);

  const validate = async (
    content: Types.PluginOutput,
    config: TypeScriptPluginConfig & TypeScriptDocumentsPluginConfig & RawGraphQLApolloPluginConfig,
    docs: Types.DocumentFile[],
    pluginSchema: GraphQLSchema,
    usage: string
  ) => {
    const m = mergeOutputs([
      await tsPlugin(pluginSchema, docs, config, { outputFile: '' }),
      await tsDocumentsPlugin(pluginSchema, docs, config),
      content,
      usage,
    ]);

    validateTs(m);

    return m;
  };

  describe('sdk', () => {
    it('Should support useTypeImports', async () => {
      const config = { useTypeImports: true };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('@apollo/client').ApolloClient;
  const client = new Client('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });

    it('Should generate Sdk correctly', async () => {
      const config = {};
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('@apollo/client').ApolloClient;
  const client = new Client('');
  const sdk = getSdk(client);

  await sdk.feed();
  await sdk.feed3();
  await sdk.feed4();

  const result = await sdk.feed2({ v: "1" });

  if (result.feed) {
    if (result.feed[0]) {
      const id = result.feed[0].id
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });
  });
});
