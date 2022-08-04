import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { validateTs } from '@graphql-codegen/testing';
import { RawJitSdkPluginConfig } from '../src/config.js';
import { plugin } from '../src/index.js';
import { parse, buildClientSchema, GraphQLSchema, printSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin, TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations';

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

const docWithSubscription = parse(/* GraphQL */ `
  query feed {
    feed {
      id
    }
  }

  subscription commentAdded {
    commentAdded {
      id
    }
  }
`);

const unnamedDoc = parse(/* GraphQL */ `
  {
    feed {
      id
    }
  }
`);

const validate = async (
  content: Types.PluginOutput,
  config: TypeScriptPluginConfig & TypeScriptDocumentsPluginConfig & RawJitSdkPluginConfig,
  docs: Types.DocumentFile[],
  pluginSchema: GraphQLSchema,
  usage: string
) => {
  const m = mergeOutputs([
    await tsPlugin(pluginSchema, docs, config, { outputFile: '' }),
    await tsDocumentsPlugin(pluginSchema, docs, config, { outputFile: '' }),
    content,
    usage,
  ]);

  validateTs(m, {
    allowSyntheticDefaultImports: true,
  });

  return m;
};

describe('jit-sdk', () => {
  describe('sdk', () => {
    it('Should generate a correct wrap method', async () => {
      const config = {};
      const docs = [{ filePath: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const schema = buildSchema(\`${printSchema(schema).trim()}\`);
  const sdk = getJitSdk(schema);

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
      const docs = [{ filePath: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const schema = buildSchema(\`${printSchema(schema).trim()}\`);
  const sdk = getJitSdk(schema);

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

    it('Should generate a correct wrap method in case of Subscription', async () => {
      const docs = [{ filePath: '', document: docWithSubscription }];
      const result = (await plugin(schema, docs, {}, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;

      const output = await validate(result, {}, docs, schema, '');
      expect(output).toMatchSnapshot();
    });

    it('Should throw if it encounters unnamed operations', async () => {
      const docs = [{ filePath: '', document: unnamedDoc }];
      try {
        await plugin(schema, docs, {}, { outputFile: 'graphql.ts' });
        fail('Should throw');
      } catch (err: unknown) {
        expect(err).toMatchInlineSnapshot(`
[Error: Plugin 'Jit-sdk' cannot generate SDK for unnamed operation.

{
  feed {
    id
  }
}]
`);
      }
    });
  });
});
