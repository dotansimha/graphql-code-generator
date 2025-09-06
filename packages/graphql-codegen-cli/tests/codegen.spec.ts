import { join } from 'path';
import '@graphql-codegen/testing';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { buildASTSchema, buildSchema, GraphQLObjectType, parse, print, OperationDefinitionNode, Kind } from 'graphql';
import { createContext, executeCodegen } from '../src/index.js';
import type { Types } from '@graphql-codegen/plugin-helpers';

const SHOULD_NOT_THROW_STRING = 'SHOULD_NOT_THROW';
const SIMPLE_TEST_SCHEMA = `type MyType { f: String } type Query { f: String }`;

describe('Codegen Executor', () => {
  describe('Generator General Options', () => {
    it('Should output the correct filenames', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': { plugins: ['typescript'] },
          'out2.ts': { plugins: ['typescript'] },
        },
      });

      expect(result.length).toBe(2);
      expect(result.map(f => f.filename)).toEqual(expect.arrayContaining(['out1.ts', 'out2.ts']));
    });

    it('Should load require extensions', async () => {
      expect((global as any).dummyWasLoaded).toBeFalsy();
      const { result } = await executeCodegen({
        schema: join(__dirname, './test-files/schema-dir/schema-object.cjs'),
        require: join(__dirname, './dummy-require.js'),
        generates: {
          'out1.ts': { plugins: ['typescript'] },
        },
        cwd: __dirname,
      });

      expect(result.length).toBe(1);
      expect((global as any).dummyWasLoaded).toBeTruthy();
    });

    it('Should throw when require extension is invalid', async () => {
      try {
        await executeCodegen({
          schema: join(__dirname, './test-files/schema-dir/schema-object.js'),
          require: join(__dirname, './missing.js'),
          generates: {
            'out1.ts': { plugins: ['typescript'] },
          },
          cwd: __dirname,
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
      }
    });

    it('Should accept plugins as object', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: [
              {
                'typescript-operations': {},
              },
            ],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type RootQuery');
    });

    it('Should accept plugins as array of objects', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: [{ 'typescript-operations': {} }],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type RootQuery');
    });

    it('Should throw when no output files has been specified', async () => {
      try {
        await executeCodegen({
          schema: SIMPLE_TEST_SCHEMA,
          generates: {},
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
        expect(e.message).toMatch('Invalid Codegen Configuration!');
      }
    });

    it('Should work with just schema', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(result.length).toBe(1);
    });

    it('Should not throw when every output has a schema and there is no root schema', async () => {
      try {
        const { result } = await executeCodegen({
          generates: {
            'out.ts': {
              schema: SIMPLE_TEST_SCHEMA,
              plugins: ['typescript'],
            },
          },
        });

        expect(result.length).toBe(1);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
        expect(e.message).not.toMatch('Invalid Codegen Configuration!');
      }
    });

    it('Should throw when there is no root schema and some outputs have not defined its own schema', async () => {
      try {
        await executeCodegen({
          generates: {
            'out.ts': {
              plugins: ['typescript'],
            },
          },
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).toMatch('Invalid Codegen Configuration!');
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
      }
    });

    it('Should throw when one output has no plugins or preset defined', async () => {
      expect.assertions(1);
      try {
        await executeCodegen({
          schema: SIMPLE_TEST_SCHEMA,
          generates: {
            'out.ts': {},
          },
        });
      } catch (e) {
        expect(e.message).toMatch('Invalid Codegen Configuration!');
      }
    });

    it('Should throw when one output has no plugins defined', async () => {
      expect.assertions(1);
      try {
        await executeCodegen({
          schema: SIMPLE_TEST_SCHEMA,
          generates: {
            'out.ts': {
              plugins: [],
            },
          },
        });
      } catch (e) {
        expect(e.message).toMatch('Invalid Codegen Configuration!');
      }
    });

    it('Should succeed when one output has no plugins but preset defined', async () => {
      await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          './src/gql/': {
            preset: 'client-preset',
          },
        },
      });
    });

    it('should handle extend keyword when GraphQLSchema is used', async () => {
      const { result } = await executeCodegen({
        schema: './tests/test-files/schema-dir/with-extend.js',
        generates: {
          'out.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].filename).toBe('out.ts');
      expect(result[0].content).toContain(`hello?: Maybe<Scalars['String']['output']>`);
    });
  });

  describe('Per-output options', () => {
    it('Should allow to specify schema extension for specific output', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': {
            schema: `
              type OtherType { a: String }
            `,
            plugins: ['typescript'],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type Query');
      expect(result[0].content).toContain('export type MyType');
      expect(result[0].content).toContain('export type OtherType');
    });

    it('Should allow to specify documents extension for specific output', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': {
            documents: `query q { f }`,
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type QQuery');
    });

    it('Should extend existing documents', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            documents: `query q { f }`,
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type QQuery');
    });

    it('Should return error on duplicated names', async () => {
      const { error } = await executeCodegen({
        schema: `
            type RootQuery { f: String }
            schema { query: RootQuery }
          `,
        documents: [`query q { e }`, `query q { f }`],
        generates: {
          'out1.ts': { plugins: ['typescript'] },
        },
      });
      expect(error.message).toContain('Not all operations have an unique name: q');
    });

    it('should handle gql tag in ts with with nested fragment', async () => {
      const { result } = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: ['./tests/test-documents/my-fragment.ts', './tests/test-documents/query-with-my-fragment.ts'],
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });
      expect(result[0].content).toContain('MyQuery');
      expect(result[0].filename).toEqual('out1.ts');
    });

    it('should handle gql tag in ts with with multiple nested fragment', async () => {
      const { result } = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: ['./tests/test-documents/my-fragment.ts', './tests/test-documents/query-with-my-fragment.ts'],
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(result[0].content).toContain('MyQuery');
      expect(result[0].filename).toEqual('out1.ts');
    });

    it('should handle gql tag in js with with nested fragment', async () => {
      const { result } = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: ['./tests/test-documents/js-query-with-my-fragment.js', './tests/test-documents/js-my-fragment.js'],
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(result[0].content).toContain('MyQuery');
      expect(result[0].filename).toEqual('out1.ts');
    });

    it('should handle TypeScript features', async () => {
      const { result } = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: ['./tests/test-documents/ts-features-with-query.ts'],
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(result[0].content).toContain('MyQuery');
      expect(result[0].content).toContain('MyQueryInNamespace');
      expect(result[0].filename).toEqual('out1.ts');
    });

    it('should handle multiple fragments with the same name, but one is commented out', async () => {
      const { result } = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: ['./tests/test-documents/query-with-commented-fragment.ts'],
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });
      expect(result[0].content).toContain('MyQuery');
      expect(result[0].filename).toEqual('out1.ts');
    });

    it('should handle graphql-tag and gatsby by default (documents)', async () => {
      const { result } = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: ['./tests/test-documents/gatsby-and-custom-parsers.ts'],
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(result[0].content).toContain('FragmentA'); // import gql from 'graphql-tag'
      expect(result[0].content).toContain('FragmentB'); // import { graphql } from 'gatsby'
    });

    it('should handle custom graphql string parsers (documents)', async () => {
      const { result } = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: ['./tests/test-documents/gatsby-and-custom-parsers.ts'],
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
          },
        },
        pluckConfig: {
          modules: [
            {
              name: 'custom-graphql-parser',
              identifier: 'parser',
            },
          ],
        },
      });

      expect(result[0].content).toContain('FragmentC'); // import { parser } from 'custom-graphql-parser';
    });

    // Dotan: @kamil please check
    it.skip('should handle graphql-tag and gatsby by default (schema)', async () => {
      const result = await executeCodegen({
        schema: './tests/test-files/schema-dir/gatsby-and-custom-parsers/*.ts',
        generates: {
          'out1.ts': { plugins: ['typescript'] },
        },
      });

      const { content } = result[0];

      expect(content).toContain('Used graphql-tag'); // import gql from 'graphql-tag'
      expect(content).toContain('Used gatsby'); // import { graphql } from 'gatsby'
      expect(content).not.toContain('Used custom parser');
    });

    // Dotan: @kamil please check
    it.skip('should handle custom graphql string parsers (schema)', async () => {
      const result = await executeCodegen({
        schema: './tests/test-files/schema-dir/gatsby-and-custom-parsers/*.ts',
        generates: {
          'out1.ts': { plugins: ['typescript'] },
        },
        pluckConfig: {
          modules: [
            {
              name: 'custom-graphql-parser',
              identifier: 'parser',
            },
          ],
        },
      });

      const { content } = result[0];

      expect(content).toContain('Used custom parser'); // import { parser } from 'custom-graphql-parser';
      expect(content).not.toContain('Used graphql-tag');
      expect(content).not.toContain('Used gatsby');
    });
  });

  describe('Plugin Configuration', () => {
    it('Should inherit root config', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        config: {
          namingConvention: 'change-case-all#lowerCase',
        },
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type rootquery');
      expect(result[0].content).toContain('export type root');
    });

    it('Should accept config in per-output (override)', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            config: {
              namingConvention: 'change-case-all#lowerCase',
            },
            plugins: ['typescript', 'typescript-operations'],
          },
          'out2.ts': {
            config: {
              namingConvention: 'change-case-all#upperCase',
            },
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(result.length).toBe(2);
      expect(result[0].content).toContain('export type rootquery');
      expect(result[1].content).toContain('export type ROOTQUERY');
    });

    it('Should accept config in per-plugin', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: [
              {
                'typescript-operations': {
                  namingConvention: 'change-case-all#lowerCase',
                },
              },
            ],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type root');
      expect(result[0].content).toContain('export type rootquery');
    });

    it('Should allow override of config in', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        config: {
          namingConvention: 'change-case-all#lowerCase',
        },
        generates: {
          'out1.ts': {
            plugins: [
              {
                'typescript-operations': {
                  namingConvention: 'change-case-all#upperCase',
                },
              },
            ],
          },
          'out2.ts': {
            plugins: [
              {
                'typescript-operations': {
                  namingConvention: 'change-case-all#pascalCase',
                },
              },
            ],
          },
        },
      });

      expect(result.length).toBe(2);
      expect(result[0].content).toContain('export type ROOTQUERY');
      expect(result[1].content).toContain('export type RootQuery');
    });
  });

  describe('Plugin loading', () => {
    it('Should load custom plugin from local file', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': {
            plugins: ['./tests/custom-plugins/basic.js'],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('plugin');
    });

    it('Should return error when custom plugin is not valid', async () => {
      const { error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': {
            plugins: ['./tests/custom-plugins/invalid.js'],
          },
        },
      });
      expect(error.message).toContain('Invalid Custom Plugin');
    });

    it('Should execute custom plugin validation and return error when it fails', async () => {
      const { error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': {
            plugins: ['./tests/custom-plugins/validation.js'],
          },
        },
      });
      expect(error.message).toContain('validation failed');
    });

    it('Should allow plugins to extend schema', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': {
            plugins: ['./tests/custom-plugins/extends-schema.js', './tests/custom-plugins/checks-extended-schema.js'],
          },
        },
      });

      expect(result[0].content).toContain('MyType,');
      expect(result[0].content).toContain('Extension');
      expect(result[0].content).toContain(`Should have the Extension type: 'Extension'`);
    });

    it('Should allow plugins to extend schema (using a function)', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        config: {
          test: 'MyType',
        },
        generates: {
          'out1.ts': {
            plugins: ['./tests/custom-plugins/extends-schema-fn.js'],
          },
        },
      });

      expect(result[0].content).toContain('MyType');
    });
  });

  describe('Schema Merging', () => {
    it('should keep definitions of all directives', async () => {
      const merged = buildASTSchema(
        mergeTypeDefs([
          buildSchema(SIMPLE_TEST_SCHEMA),
          buildSchema(/* GraphQL */ `
            directive @id on FIELD_DEFINITION

            type Post {
              id: String @id
            }
          `),
        ])
      );

      expect(merged.getDirectives().map(({ name }) => name)).toContainEqual('id');
    });

    it('should keep directives in types', async () => {
      const merged = buildASTSchema(
        mergeTypeDefs([
          buildSchema(SIMPLE_TEST_SCHEMA),
          buildSchema(/* GraphQL */ `
            directive @id on FIELD_DEFINITION
            directive @test on OBJECT

            type Post @test {
              id: String @id
            }

            type Query {
              posts: [Post]
            }

            schema {
              query: Query
            }
          `),
        ])
      );

      expect(merged.getType('Post').astNode.directives.map(({ name }) => name.value)).toContainEqual('test');
      expect(
        (merged.getType('Post') as GraphQLObjectType).getFields().id.astNode.directives.map(({ name }) => name.value)
      ).toContainEqual('id');
    });

    it('should keep scalars', async () => {
      const schemaA = SIMPLE_TEST_SCHEMA;
      const schemaB = `
        scalar UniqueID

        type Post {
          id: UniqueID
        }
      `;
      const schemaC = parse(`
        scalar NotUniqueID
      `);

      const merged = mergeTypeDefs([schemaA, schemaB, schemaC]);

      expect(print(merged)).toContain('scalar UniqueID');
      expect(print(merged)).toContain('scalar NotUniqueID');

      const schema = buildASTSchema(merged);

      expect(schema.getType('UniqueID')).toBeDefined();
      expect(schema.getType('NotUniqueID')).toBeDefined();
    });

    it('should keep scalars when executing codegen', async () => {
      const schemaA = SIMPLE_TEST_SCHEMA;
      const schemaB = `
        scalar UniqueID

        type Post {
          id: UniqueID
        }
      `;

      const { result } = await executeCodegen({
        schema: [schemaA, schemaB],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toBeSimilarStringTo(`export type Scalars = {
        ID: { input: string; output: string; }
        String: { input: string; output: string; }
        Boolean: { input: boolean; output: boolean; }
        Int: { input: number; output: number; }
        Float: { input: number; output: number; }
        UniqueID: { input: any; output: any; }
      };`);
    });
  });

  describe('Custom schema loader', () => {
    it('Should allow custom loaders to load schema on root level', async () => {
      await executeCodegen({
        schema: [
          {
            './tests/test-documents/schema.graphql': {
              loader: './tests/custom-loaders/custom-schema-loader.cjs',
            },
          },
        ],
        generates: {
          'out1.ts': { plugins: ['typescript'] },
        },
      });

      expect((global as any).CUSTOM_SCHEMA_LOADER_CALLED).toBeTruthy();
    });

    it('Should allow custom loaders to load schema on output level', async () => {
      await executeCodegen({
        generates: {
          'out1.ts': {
            schema: [
              {
                './tests/test-documents/schema.graphql': {
                  loader: './tests/custom-loaders/custom-schema-loader.cjs',
                },
              },
            ],
            plugins: ['typescript'],
          },
        },
      });

      expect((global as any).CUSTOM_SCHEMA_LOADER_CALLED).toBeTruthy();
    });

    it('Should return error when invalid return value from loader', async () => {
      const { error } = await executeCodegen({
        schema: [
          {
            './tests/test-documents/schema.graphql': {
              loader: './tests/custom-loaders/invalid-return-value-schema-loader.cjs',
            },
          },
        ],
        generates: {
          'out1.ts': { plugins: ['typescript'] },
        },
      });

      expect(error.message).toContain('Failed to load schema');
    });

    it('Should return error when invalid module specified as loader', async () => {
      const { error } = await executeCodegen({
        schema: [
          {
            './tests/test-documents/schema.graphql': {
              loader: './tests/custom-loaders/non-existing.js',
            },
          },
        ],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(error.message).toContain('Failed to load custom loader');
    });

    it('Should return error when invalid file declaration', async () => {
      const { error } = await executeCodegen({
        schema: [
          {
            './tests/test-documents/schema.graphql': {
              loader: './tests/custom-loaders/invalid-export.cjs',
            },
          },
        ],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(error.message).toContain('Failed to load schema');
      expect(error.message).toContain('Failed to load custom loader');
    });
  });

  describe('Custom documents loader', () => {
    it('Should allow to use custom documents loader on root level', async () => {
      await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: [
          {
            './tests/test-documents/valid.graphql': {
              loader: './tests/custom-loaders/custom-documents-loader.cjs',
            },
          },
        ],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect((global as any).CUSTOM_DOCUMENT_LOADER_CALLED).toBeTruthy();
    });

    it('Should allow custom loaders to load documents on output level', async () => {
      await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        generates: {
          'out1.ts': {
            documents: [
              {
                './tests/test-documents/valid.graphql': {
                  loader: join(__dirname, './custom-loaders/custom-documents-loader.js'),
                },
              },
            ],
            plugins: ['typescript'],
          },
        },
      });

      expect((global as any).CUSTOM_DOCUMENT_LOADER_CALLED).toBeTruthy();
    });

    it('Should return error when invalid return value from custom documents loader', async () => {
      const { error } = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: [
          {
            './tests/test-documents/valid.graphql': {
              loader: './tests/custom-loaders/invalid-return-value-documents-loader.cjs',
            },
          },
        ],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(error.message).toContain('Unable to find any GraphQL type definitions for the following pointers');
    });

    it('Should return error when invalid module specified as loader', async () => {
      const { error } = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: [
          {
            './tests/test-documents/valid.graphql': {
              loader: './tests/custom-loaders/non-existing.js',
            },
          },
        ],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(error.message).toContain('Failed to load custom loader');
    });

    it('Should return error when invalid file declaration', async () => {
      const { error } = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: [
          {
            './tests/test-documents/valid.graphql': {
              loader: './tests/custom-loaders/invalid-export.cjs',
            },
          },
        ],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(error.message).toContain('Failed to load custom loader');
    });
  });

  it('should load schema with custom fetch', async () => {
    try {
      await executeCodegen({
        schema: ['http://www.dummyschema.com/graphql'],
        customFetch: 'some-fetch#someFetchFn',
        documents: ['./tests/test-documents/valid.graphql'],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });
    } catch (error) {
      expect(error.message).toContain('Failed to load schema from http://www.dummyschema.com/graphql');
    }
    expect((global as any).CUSTOM_FETCH_FN_CALLED).toBeTruthy();
  });

  it('should load schema with custom fetch function', async () => {
    let fetchCalledFor = null;

    async function myCustomFetch(url: string, _options?: RequestInit): Promise<Response> {
      fetchCalledFor = url;
      return Promise.resolve(new Response());
    }

    try {
      await executeCodegen({
        schema: ['http://www.dummyschema.com/graphql'],
        customFetch: myCustomFetch,
        documents: ['./tests/test-documents/valid.graphql'],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });
    } catch (error) {
      expect(error.message).toContain('Failed to load schema from http://www.dummyschema.com/graphql');
    }
    expect(fetchCalledFor).toBe('http://www.dummyschema.com/graphql');
  });

  it('should evaluate glob expressions correctly', async () => {
    try {
      await executeCodegen({
        schema: ['./tests/test-documents/*schema.graphql', '!./tests/test-documents/invalid-schema.graphql'],
        documents: [
          './tests/test-documents/*.graphql',
          '!./tests/test-documents/invalid-*.graphql',
          '!./tests/test-documents/unused-*.graphql',
        ],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      throw new Error('This should not throw as the invalid file is excluded via glob.');
    }
  });

  it('Should allow plugins to extend schema with custom root', async () => {
    try {
      const { result } = await executeCodegen({
        schema: `schema { query: RootQuery } type MyType { f: String } type RootQuery { f: String }`,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: ['./tests/custom-plugins/extends-schema.js', './tests/custom-plugins/checks-extended-schema.js'],
          },
        },
      });
      expect(result.length).toBe(1);
    } catch (e) {
      expect(e.message).not.toBe('Query root type must be provided.');
    }
  });

  it('Should allow plugin context to be accessed and modified', async () => {
    const { result } = await executeCodegen({
      schema: [
        {
          './tests/test-documents/schema.graphql': {
            loader: './tests/custom-loaders/custom-schema-loader-with-context.cjs',
          },
        },
      ],
      generates: {
        'out1.ts': {
          plugins: ['./tests/custom-plugins/context.js'],
        },
      },
    });

    expect(result.length).toBe(1);
    expect(result[0].content).toContain('Hello world!');
  });

  it('Should sort the input schema', async () => {
    const nonSortedSchema = /* GraphQL */ `
      type Query {
        d: String
        z: String
        a: String
      }

      type User {
        aa: String
        a: String
      }

      type A {
        s: String
        b: String
      }
    `;
    const { result } = await executeCodegen({
      schema: [nonSortedSchema],
      generates: {
        'out1.graphql': {
          plugins: ['schema-ast'],
        },
      },
      config: {
        sort: true,
      },
    });

    expect(result.length).toBe(1);
    expect(result[0].content).toBeSimilarStringTo(/* GraphQL */ `
      type A {
        b: String
        s: String
      }

      type Query {
        a: String
        d: String
        z: String
      }

      type User {
        a: String
        aa: String
      }
    `);
  });

  it('Handles weird errors due to invalid schema', async () => {
    const schema = /* GraphQL */ `
      type Query {
        brrrt:1
      }
    `;
    try {
      await executeCodegen({
        schema: [schema],
        generates: {
          'out1.graphql': {
            plugins: ['schema-ast'],
          },
        },
      });
    } catch (error) {
      expect(error.message).toContain('Failed to load schema from');
    }
  });

  it('Should generate documents output even if prj1/documents and prj1/extensions/codegen/generate/xxx/documents are both definded with the same glob files', async () => {
    const prj1 = await createContext({
      config: './tests/test-files/graphql.config.js',
      project: 'prj1',
      errorsOnly: true,
      overwrite: true,
      profile: true,
      require: [],
      silent: false,
      watch: false,
    });
    const config = prj1.getConfig();
    const { result } = await executeCodegen(config);
    expect(result[0].content).toContain('DocumentNode<MyQueryQuery, MyQueryQueryVariables>');
  });

  describe('Document Transform', () => {
    it('Should transform documents', async () => {
      const transform: Types.DocumentTransformFunction = ({ documents }) => {
        const newDocuments = [
          {
            document: {
              ...documents[0].document,
              definitions: [
                {
                  ...documents[0].document.definitions[0],
                  name: { kind: Kind.NAME, value: 'bar' },
                } as OperationDefinitionNode,
              ],
            },
          },
        ];
        return newDocuments;
      };

      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query foo { f }`,
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
            documentTransforms: [{ transform }],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type BarQuery');
    });

    it('Should allow users to set config', async () => {
      const generateDocumentTransform: (config: { queryName: string }) => Types.DocumentTransformObject = ({
        queryName,
      }) => {
        return {
          transform: ({ documents }) => {
            const newDocuments = [
              {
                document: {
                  ...documents[0].document,
                  definitions: [
                    {
                      ...documents[0].document.definitions[0],
                      name: { kind: Kind.NAME, value: queryName },
                    } as OperationDefinitionNode,
                  ],
                },
              },
            ];
            return newDocuments;
          },
        };
      };

      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query foo { f }`,
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
            documentTransforms: [generateDocumentTransform({ queryName: 'test' })],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type TestQuery');
    });

    it('Should transform documents when specifying files', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
            documentTransforms: ['./tests/custom-document-transforms/document-transform.js'],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type BarQuery');
    });

    it('Should allow users to set config when specifying files', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
            documentTransforms: [
              {
                './tests/custom-document-transforms/test-config.js': {
                  queryName: 'test',
                },
              },
            ],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('export type TestQuery');
    });

    it('Should allow plugin context to be accessed and modified', async () => {
      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            documentTransforms: [
              {
                transform: ({ pluginContext, documents }) => {
                  pluginContext.myPluginInfo = 'world';
                  return documents;
                },
              },
            ],
            plugins: ['./tests/custom-plugins/document-transform-context.js'],
          },
        },
      });

      expect(result.length).toBe(1);
      expect(result[0].content).toContain('Hello world!');
    });

    it('should return error an understandable error if it fails.', async () => {
      const { error } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query foo { f }`,
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
            documentTransforms: [
              {
                transform: () => {
                  throw new Error('Something Wrong!');
                },
              },
            ],
          },
        },
      });

      expect(error.message).toContain('DocumentTransform "the element at index 0 of the documentTransforms" failed');
      expect(error.message).toContain('Something Wrong!');
    });

    it('Should transform documents with client-preset', async () => {
      const transform: Types.DocumentTransformFunction = ({ documents }) => {
        const newDocuments = [
          {
            document: {
              ...documents[0].document,
              definitions: [
                {
                  ...documents[0].document.definitions[0],
                  name: { kind: Kind.NAME, value: 'bar' },
                } as OperationDefinitionNode,
              ],
            },
          },
        ];
        return newDocuments;
      };

      const { result } = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query foo { f }`,
        generates: {
          './src/gql/': {
            preset: 'client',
            documentTransforms: [{ transform }],
          },
        },
      });

      const fileOutput = result.find(file => file.filename === './src/gql/graphql.ts');
      expect(fileOutput.content).toContain('export type BarQuery');
    });
  });

  it('should not run out of memory when generating very complex types (issue #7720)', async () => {
    const { result } = await executeCodegen({
      schema: ['../../dev-test/gatsby/schema.graphql'],
      documents: ['../../dev-test/gatsby/fragments.ts'],
      config: {
        extractAllFieldsToTypes: true,
        dedupeOperationSuffix: true,
      },
      generates: {
        'out1.ts': {
          plugins: ['typescript', 'typescript-operations'],
        },
      },
    });
    expect(result.length).toBe(1);
    expect(result[0].content).toContain('export type WpCoreImageBlockForGalleryFragment = ');
  });
});
