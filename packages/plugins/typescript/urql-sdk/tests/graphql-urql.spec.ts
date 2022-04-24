import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index';
import { parse, buildClientSchema, GraphQLSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin, TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations';
import { RawGraphQLUrqlPluginConfig } from '../src/config';

describe('urql-core', () => {
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
    config: TypeScriptPluginConfig & TypeScriptDocumentsPluginConfig & RawGraphQLUrqlPluginConfig,
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
  const { Client } = await import('@urql/core');
  const client = new Client({ url: '/graphql' });
  const sdk = getSdk(client);

  await sdk.feed().toPromise();
  await sdk.feed3().toPromise();
  await sdk.feed4().toPromise();

  const result = await sdk.feed2({ v: '1' }).toPromise();

  if (result.data?.feed) {
    if (result.data.feed[0]) {
      const id = result.data.feed[0].id;
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
  const { Client } = await import('@urql/core');
  const client = new Client({ url: '/graphql' });
  const sdk = getSdk(client);

  await sdk.feed().toPromise();
  await sdk.feed3().toPromise();
  await sdk.feed4().toPromise();

  const result = await sdk.feed2({ v: '1' }).toPromise();

  if (result.data?.feed) {
    if (result.data.feed[0]) {
      const id = result.data.feed[0].id;
    }
  }
}`;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });
  });
});
