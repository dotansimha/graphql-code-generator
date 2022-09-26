import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { validateTs } from '@graphql-codegen/testing';
import { plugin } from '../src/index.js';
import { parse, buildClientSchema, GraphQLSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin, TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations';
import { RawGraphQLRequestPluginConfig } from '../src/config.js';

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

    validateTs(m);

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

      expect(result.content).toContain(
        `(FeedDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'feed', 'query');`
      );
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

    it('Should support useTypeImports', async () => {
      const config = { useTypeImports: true };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
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

    it('Should support emitLegacyCommonJSImports: false by emitting imports with extensions', async () => {
      const config = { emitLegacyCommonJSImports: false };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
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

    it('Should support rawRequest when documentMode = "documentNode"', async () => {
      const config = { rawRequest: true };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
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

    it('Should not import print as type when supporting useTypeImports and rawRequest and documentMode = "documentNode"', async () => {
      const config = { rawRequest: true, useTypeImports: true };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
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

    it('Should support extensionType when rawRequest is true and documentMode = "DocumentNode"', async () => {
      const config = { rawRequest: true, extensionsType: 'unknown' };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
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

    it('extensionType should be irrelevant when rawRequest is false', async () => {
      const config = { rawRequest: false, extensionsType: 'unknown' };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const usage = `
async function test() {
  const Client = require('graphql-request').GraphQLClient;
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

  describe('issues', () => {
    it('#5386 - should provide a nice error when dealing with anonymous operations', async () => {
      const doc = parse(/* GraphQL */ `
        query {
          feed {
            id
          }
        }
      `);

      const warnSpy = jest.spyOn(console, 'warn');
      const docs = [{ location: 'file.graphlq', document: doc }];
      const result = (await plugin(schema, docs, {}, {})) as Types.ComplexPluginOutput;
      expect(result.content).not.toContain('feed');
      expect(warnSpy.mock.calls.length).toBe(1);
      expect(warnSpy.mock.calls[0][0]).toContain('Anonymous GraphQL operation was ignored');
      expect(warnSpy.mock.calls[0][1]).toContain('feed');
      warnSpy.mockRestore();
    });

    it('#4748 - integration with importDocumentNodeExternallyFrom', async () => {
      const config = { importDocumentNodeExternallyFrom: './operations', documentMode: DocumentMode.external };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;
      const output = await validate(result, config, docs, schema, '');

      expect(output).toContain(`import * as Operations from './operations';`);
      expect(output).toContain(
        `(Operations.FeedDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'feed', 'query');`
      );
      expect(output).toContain(
        `(Operations.Feed2Document, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'feed2', 'query');`
      );
      expect(output).toContain(
        `(Operations.Feed3Document, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'feed3', 'query');`
      );
    });

    it('#7114 - honor importOperationTypesFrom', async () => {
      const config = { importOperationTypesFrom: 'Types' };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;
      const output = await validate(result, config, docs, schema, '');

      expect(output).toContain(`Types.FeedQuery`);
      expect(output).toContain(`Types.Feed2Query`);
      expect(output).toContain(`Types.Feed3Query`);
      expect(output).toContain(`Types.Feed4Query`);
    });
  });
});
