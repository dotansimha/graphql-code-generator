import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { compileTs } from '@graphql-codegen/testing';
import { plugin, defaultWrapper, SdkFunctionWrapper } from '../src/index';
import { parse, buildClientSchema } from 'graphql';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { plugin as tsDocumentsPlugin } from '@graphql-codegen/typescript-operations';
import { readFileSync } from 'fs';
import * as ts from 'typescript';
import { GraphQLClient } from 'graphql-request';
import nock from 'nock';

describe('graphql-request', () => {
  beforeAll(() => nock.disableNetConnect());
  afterAll(() => nock.enableNetConnect());
  afterEach(() => nock.cleanAll());

  const schema = buildClientSchema(JSON.parse(readFileSync('../../../../dev-test/githunt/schema.json').toString()));
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

  const validateAndCompile = async (content: Types.PluginOutput, config, docs, pluginSchema, usage = '') => {
    const m = mergeOutputs([await tsPlugin(pluginSchema, docs, config, { outputFile: '' }), await tsDocumentsPlugin(pluginSchema, docs, config), content, usage]);

    await compileTs(m);

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
      const output = await validateAndCompile(result, config, docs, schema, usage);

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
      const output = await validateAndCompile(result, config, docs, schema, usage);

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
      const output = await validateAndCompile(result, config, docs, schema, usage);

      expect(output).toMatchSnapshot();
    });

    // lazy eval to save time
    let getSdk;
    const perpareTranspiledModule = async (middleware?: SdkFunctionWrapper) => {
      const config = { documentMode: DocumentMode.string };
      const docs = [{ location: '', document: basicDoc }];
      const result = (await plugin(schema, docs, config, {
        outputFile: 'graphql.ts',
      })) as Types.ComplexPluginOutput;

      const output = await validateAndCompile(result, config, docs, schema);
      const moduleResult = ts.transpileModule(output, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
      // ignore eslint no-eval check. should be fine for unit tests only
      // eslint-disable-next-line no-eval
      getSdk = getSdk || eval(moduleResult.outputText);

      const fakeApiEndpoint = 'https://mockme.foo/';
      const client = new GraphQLClient(fakeApiEndpoint);
      const scope = nock(fakeApiEndpoint)
        .post('/')
        .reply(200, { data: { feed: [{ id: 1 }] } });

      return {
        sdk: middleware ? getSdk(client, middleware) : getSdk(client),
        scope,
      };
    };

    it(
      'should execute default no-op middleware when none passed to getSdk',
      async () => {
        const { sdk, scope } = await perpareTranspiledModule();

        const result = await sdk.feed();

        scope.done();
        expect(result).toMatchSnapshot();
      },
      20 * 1000
    );

    it(
      'Should execute middleware passed to getSdk',
      async () => {
        let middlewareExecuted = false;
        const middleware: SdkFunctionWrapper = (action: () => Promise<any>): Promise<any> => {
          middlewareExecuted = true;
          return action();
        };

        const { sdk, scope } = await perpareTranspiledModule(middleware);

        const result = await sdk.feed();

        scope.done();
        expect(middlewareExecuted).toBe(true);
        expect(result).toMatchSnapshot();
      },
      20 * 1000
    );
  });
});
