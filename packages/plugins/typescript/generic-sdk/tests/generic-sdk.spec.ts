import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { validateTs } from '@graphql-codegen/testing';
import { RawGenericSdkPluginConfig } from '../src/config.js';
import { plugin } from '../src/index.js';
import { parse, buildClientSchema, GraphQLSchema, extendSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin, TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations';

const schema = extendSchema(
  buildClientSchema(require('../../../../../dev-test/githunt/schema.json')),
  parse(/* GraphQL */ `
    directive @live on QUERY
  `)
);
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

  query feedLive @live {
    feed {
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
  config: TypeScriptPluginConfig & TypeScriptDocumentsPluginConfig & RawGenericSdkPluginConfig,
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

describe('generic-sdk', () => {
  describe('sdk', () => {
    it('Should generate a correct wrap method', async () => {
      const config = {};
      const docs = [{ filePath: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const requester = <R, V> (doc: DocumentNode, vars: V): Promise<R> => Promise.resolve({} as unknown as R);
  const sdk = getSdk(requester);

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
  const requester = <R, V> (doc: string, vars: V): Promise<R> => Promise.resolve({} as unknown as R);
  const sdk = getSdk(requester);

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

    it('Should support rawRequest', async () => {
      const config = { rawRequest: true };
      const docs = [{ filePath: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
        async function rawRequestTest() {
          const requester = <R, V> (doc: string, vars: V): Promise<ExecutionResult<R>> => Promise.resolve({} as unknown as ExecutionResult<R>);
          const sdk = getSdk(requester);

          await sdk.feed();
          await sdk.feed3();
          await sdk.feed4();

          const result = await sdk.feed2({ v: "1" });

          if (result.data.feed) {
            if (result.data.feed[0]) {
              const id = result.data.feed[0].id
            }
          }
        }
      `;
      const output = await validate(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });

    it('Should generate a correct wrap method when usingObservableFrom is not set', async () => {
      const config = {};
      const docs = [{ filePath: '', document: docWithSubscription }];
      const result = (await plugin(schema, docs, config, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;

      const usage = /* TypeScript */ `
        async function test() {
          const sdk = getSdk((() => {}) as any);
          const test = sdk.commentAdded();
          for await (const item of test) {
            console.log(item.data);
            console.log(item.errors);
          }
        }
      `;

      const output = await validate(result, config, docs, schema, usage);
      expect(output).toMatchSnapshot();
    });

    it('Should generate a correct wrap method when usingObservableFrom is set', async () => {
      const config = { usingObservableFrom: "import Observable from 'zen-observable';" };
      const docs = [{ filePath: '', document: docWithSubscription }];
      const result = (await plugin(schema, docs, config, { outputFile: 'graphql.ts' })) as Types.ComplexPluginOutput;

      const output = await validate(result, config, docs, schema, '');
      expect(output).toMatchSnapshot();
    });

    it('Should throw if it encounters unnamed operations', async () => {
      const config = { usingObservableFrom: "import Observable from 'zen-observable';" };
      const docs = [{ filePath: '', document: unnamedDoc }];
      try {
        await plugin(schema, docs, config, { outputFile: 'graphql.ts' });
        fail('Should throw');
      } catch (err: unknown) {
        expect(err).toMatchInlineSnapshot(`
[Error: Plugin 'generic-sdk' cannot generate SDK for unnamed operation.

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
