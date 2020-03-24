import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index';
import { parse, buildClientSchema, GraphQLSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin, TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations';
import { RawGraphQLRequestPluginConfig } from '../src/config';

describe('graphql-request', () => {
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
    config: TypeScriptPluginConfig & TypeScriptDocumentsPluginConfig & RawGraphQLRequestPluginConfig,
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

    await validateTs(m);

    return m;
  };

  describe('sdk', () => {
    it('Should generate a correct wrap method', async () => {
      const config = {};
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const client = new GraphQLClient('');
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

    it('Should generate a correct wrap method with documentMode=string', async () => {
      const config = { documentMode: DocumentMode.string };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const client = new GraphQLClient('');
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

    it('Should allow passing wrapper arg to generated getSdk', async () => {
      const config = { documentMode: DocumentMode.string };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const client = new GraphQLClient('');
  const functionWrapper: SdkFunctionWrapper = async <T>(action: () => Promise<T>): Promise<T> => {
    console.log('before');
    const result = await action();
    console.log('after');
    return result;
  }

  const sdk = getSdk(client, functionWrapper);
  
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
