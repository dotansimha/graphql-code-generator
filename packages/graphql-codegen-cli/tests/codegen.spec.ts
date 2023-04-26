import { join } from 'path';
import { useMonorepo } from '@graphql-codegen/testing';
import { mergeTypeDefs } from '@graphql-tools/merge';
import {
  buildASTSchema,
  buildSchema,
  GraphQLObjectType,
  parse,
  print,
  OperationDefinitionNode,
  Kind,
  visit,
  FieldNode,
  TypeInfo,
  concatAST,
  visitWithTypeInfo,
  isNonNullType,
  isObjectType,
} from 'graphql';
import { createContext, executeCodegen } from '../src/index.js';
import { Types } from '@graphql-codegen/plugin-helpers';

const SHOULD_NOT_THROW_STRING = 'SHOULD_NOT_THROW';
const SIMPLE_TEST_SCHEMA = `type MyType { f: String } type Query { f: String }`;

jest.mock('some-fetch');

const monorepo = useMonorepo({
  dirname: __dirname,
});

describe('Codegen Executor', () => {
  monorepo.correctCWD();

  beforeEach(() => {
    jest.useFakeTimers({
      legacyFakeTimers: true,
    });
  });

  describe('Generator General Options', () => {
    it('Should output the correct filenames', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': { plugins: ['typescript'] },
          'out2.ts': { plugins: ['typescript'] },
        },
      });

      expect(output.length).toBe(2);
      expect(output.map(f => f.filename)).toEqual(expect.arrayContaining(['out1.ts', 'out2.ts']));
    });

    it('Should load require extensions', async () => {
      expect((global as any).dummyWasLoaded).toBeFalsy();
      const output = await executeCodegen({
        schema: join(__dirname, './test-files/schema-dir/schema-object.js'),
        require: join(__dirname, './dummy-require.js'),
        generates: {
          'out1.ts': { plugins: ['typescript'] },
        },
        cwd: __dirname,
      });

      expect(output.length).toBe(1);
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
      const output = await executeCodegen({
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

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type RootQuery');
    });

    it('Should accept plugins as array of objects', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: [{ 'typescript-operations': {} }],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type RootQuery');
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
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(output.length).toBe(1);
    });

    it('Should not throw when every output has a schema and there is no root schema', async () => {
      try {
        const output = await executeCodegen({
          generates: {
            'out.ts': {
              schema: SIMPLE_TEST_SCHEMA,
              plugins: ['typescript'],
            },
          },
        });

        expect(output.length).toBe(1);
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
      const output = await executeCodegen({
        schema: './tests/test-files/schema-dir/with-extend.js',
        generates: {
          'out.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].filename).toBe('out.ts');
      expect(output[0].content).toContain(`hello?: Maybe<Scalars['String']>`);
    });
  });

  describe('Per-output options', () => {
    it('Should allow to specify schema extension for specific output', async () => {
      const output = await executeCodegen({
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

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type Query');
      expect(output[0].content).toContain('export type MyType');
      expect(output[0].content).toContain('export type OtherType');
    });

    it('Should allow to specify documents extension for specific output', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': {
            documents: `query q { f }`,
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type QQuery');
    });

    it('Should extend existing documents', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            documents: `query q { f }`,
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type QQuery');
    });

    it('Should throw on duplicated names', async () => {
      try {
        await executeCodegen({
          schema: `
            type RootQuery { f: String }
            schema { query: RootQuery }
          `,
          documents: [`query q { e }`, `query q { f }`],
          generates: {
            'out1.ts': { plugins: ['typescript'] },
          },
        });
        throw SHOULD_NOT_THROW_STRING;
      } catch (e) {
        expect(e).not.toEqual(SHOULD_NOT_THROW_STRING);
        expect(e.message).toContain('Not all operations have an unique name: q');
      }
    });

    it('should handle gql tag in ts with with nested fragment', async () => {
      const result = await executeCodegen({
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
      const result = await executeCodegen({
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
      const result = await executeCodegen({
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
      const result = await executeCodegen({
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
      const result = await executeCodegen({
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
      const result = await executeCodegen({
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
      const result = await executeCodegen({
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
      const output = await executeCodegen({
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

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type rootquery');
      expect(output[0].content).toContain('export type root');
    });

    it('Should accept config in per-output (override)', async () => {
      const output = await executeCodegen({
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

      expect(output.length).toBe(2);
      expect(output[0].content).toContain('export type rootquery');
      expect(output[1].content).toContain('export type ROOTQUERY');
    });

    it('Should accept config in per-plugin', async () => {
      const output = await executeCodegen({
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

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type root');
      expect(output[0].content).toContain('export type rootquery');
    });

    it('Should allow override of config in', async () => {
      const output = await executeCodegen({
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

      expect(output.length).toBe(2);
      expect(output[0].content).toContain('export type ROOTQUERY');
      expect(output[1].content).toContain('export type RootQuery');
    });
  });

  describe('Plugin loading', () => {
    it('Should load custom plugin from local file', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': {
            plugins: ['./tests/custom-plugins/basic.js'],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('plugin');
    });

    it('Should throw when custom plugin is not valid', async () => {
      try {
        await executeCodegen({
          schema: SIMPLE_TEST_SCHEMA,
          generates: {
            'out1.ts': {
              plugins: ['./tests/custom-plugins/invalid.js'],
            },
          },
        });
        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
        expect(e.message).toContain('Invalid Custom Plugin');
      }
    });

    it('Should execute custom plugin validation and throw when it fails', async () => {
      try {
        await executeCodegen({
          schema: SIMPLE_TEST_SCHEMA,
          generates: {
            'out1.ts': {
              plugins: ['./tests/custom-plugins/validation.js'],
            },
          },
        });
        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
        expect(e.message).toContain('validation failed');
      }
    });

    it('Should allow plugins to extend schema', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': {
            plugins: ['./tests/custom-plugins/extends-schema.js', './tests/custom-plugins/checks-extended-schema.js'],
          },
        },
      });

      expect(output[0].content).toContain('MyType,');
      expect(output[0].content).toContain('Extension');
      expect(output[0].content).toContain(`Should have the Extension type: 'Extension'`);
    });

    it('Should allow plugins to extend schema (using a function)', async () => {
      const output = await executeCodegen({
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

      expect(output[0].content).toContain('MyType');
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

      const output = await executeCodegen({
        schema: [schemaA, schemaB],
        generates: {
          'out1.ts': {
            plugins: ['typescript'],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toBeSimilarStringTo(`export type Scalars = {
        ID: string;
        String: string;
        Boolean: boolean;
        Int: number;
        Float: number;
        UniqueID: any;
      };`);
    });
  });

  describe('Custom schema loader', () => {
    it('Should allow custom loaders to load schema on root level', async () => {
      await executeCodegen({
        schema: [
          {
            './tests/test-documents/schema.graphql': {
              loader: './tests/custom-loaders/custom-schema-loader.js',
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
                  loader: './tests/custom-loaders/custom-schema-loader.js',
                },
              },
            ],
            plugins: ['typescript'],
          },
        },
      });

      expect((global as any).CUSTOM_SCHEMA_LOADER_CALLED).toBeTruthy();
    });

    it('Should throw when invalid return value from loader', async () => {
      try {
        await executeCodegen({
          schema: [
            {
              './tests/test-documents/schema.graphql': {
                loader: './tests/custom-loaders/invalid-return-value-schema-loader.js',
              },
            },
          ],
          generates: {
            'out1.ts': { plugins: ['typescript'] },
          },
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (error) {
        expect(error.message).toContain('Failed to load schema');
      }
    });

    it('Should throw when invalid module specified as loader', async () => {
      try {
        await executeCodegen({
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

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (error) {
        expect(error.message).toContain('Failed to load custom loader');
      }
    });

    it('Should throw when invalid file declaration', async () => {
      try {
        await executeCodegen({
          schema: [
            {
              './tests/test-documents/schema.graphql': {
                loader: './tests/custom-loaders/invalid-export.js',
              },
            },
          ],
          generates: {
            'out1.ts': {
              plugins: ['typescript'],
            },
          },
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (error) {
        expect(error.message).toContain('Failed to load schema');
        expect(error.message).toContain('Failed to load custom loader');
      }
    });
  });

  describe('Custom documents loader', () => {
    it('Should allow to use custom documents loader on root level', async () => {
      await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: [
          {
            './tests/test-documents/valid.graphql': {
              loader: './tests/custom-loaders/custom-documents-loader.js',
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

    it('Should throw when invalid return value from custom documents loader', async () => {
      try {
        await executeCodegen({
          schema: ['./tests/test-documents/schema.graphql'],
          documents: [
            {
              './tests/test-documents/valid.graphql': {
                loader: './tests/custom-loaders/invalid-return-value-documents-loader.js',
              },
            },
          ],
          generates: {
            'out1.ts': {
              plugins: ['typescript'],
            },
          },
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (error) {
        expect(error.message).toContain('Unable to find any GraphQL type definitions for the following pointers');
      }
    });

    it('Should throw when invalid module specified as loader', async () => {
      try {
        await executeCodegen({
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

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (error) {
        expect(error.message).toContain('Failed to load custom loader');
      }
    });

    it('Should throw when invalid file declaration', async () => {
      try {
        await executeCodegen({
          schema: ['./tests/test-documents/schema.graphql'],
          documents: [
            {
              './tests/test-documents/valid.graphql': {
                loader: './tests/custom-loaders/invalid-export.js',
              },
            },
          ],
          generates: {
            'out1.ts': {
              plugins: ['typescript'],
            },
          },
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (error) {
        expect(error.message).toContain('Failed to load custom loader');
      }
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
      const output = await executeCodegen({
        schema: `schema { query: RootQuery } type MyType { f: String } type RootQuery { f: String }`,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: ['./tests/custom-plugins/extends-schema.js', './tests/custom-plugins/checks-extended-schema.js'],
          },
        },
      });
      expect(output.length).toBe(1);
    } catch (e) {
      expect(e.message).not.toBe('Query root type must be provided.');
    }
  });

  it('Should allow plugin context to be accessed and modified', async () => {
    const output = await executeCodegen({
      schema: [
        {
          './tests/test-documents/schema.graphql': {
            loader: './tests/custom-loaders/custom-schema-loader-with-context.js',
          },
        },
      ],
      generates: {
        'out1.ts': {
          plugins: ['./tests/custom-plugins/context.js'],
        },
      },
    });

    expect(output.length).toBe(1);
    expect(output[0].content).toContain('Hello world!');
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
    const output = await executeCodegen({
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

    expect(output.length).toBe(1);
    expect(output[0].content).toBeSimilarStringTo(/* GraphQL */ `
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
    const output = await executeCodegen(config);
    expect(output[0].content).toContain('DocumentNode<MyQueryQuery, MyQueryQueryVariables>');
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

      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query foo { f }`,
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
            documentTransforms: [{ transform }],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type BarQuery');
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

      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query foo { f }`,
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
            documentTransforms: [generateDocumentTransform({ queryName: 'test' })],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type TestQuery');
    });

    it('Should transform documents when specifying files', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
            documentTransforms: ['./tests/custom-document-transforms/document-transform.js'],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type BarQuery');
    });

    it('Should allow users to set config when specifying files', async () => {
      const output = await executeCodegen({
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

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export type TestQuery');
    });

    it('Should allow plugin context to be accessed and modified', async () => {
      const output = await executeCodegen({
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

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('Hello world!');
    });

    it('should throw an understandable error if it fails.', async () => {
      try {
        await executeCodegen({
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
        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
        expect(e.message).toContain('DocumentTransform "the element at index 0 of the documentTransforms" failed');
        expect(e.message).toContain('Something Wrong!');
      }
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

      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query foo { f }`,
        generates: {
          './src/gql/': {
            preset: 'client',
            documentTransforms: [{ transform }],
          },
        },
      });

      const fileOutput = output.find(file => file.filename === './src/gql/graphql.ts');
      expect(fileOutput.content).toContain('export type BarQuery');
    });
  });

  describe('Delayed Schema Generator', () => {
    it('Should generate a schema', async () => {
      const output = await executeCodegen({
        schema: [
          SIMPLE_TEST_SCHEMA,
          {
            'delayed-schema-generator': () => `extend type Query { test: String! }`,
          },
        ],
        documents: `query foo { f }`,
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain(`test: Scalars['String']`);
    });

    it('Should generate a schema with a function read from a file', async () => {
      const output = await executeCodegen({
        schema: [
          SIMPLE_TEST_SCHEMA,
          {
            'delayed-schema-generator': './tests/delayed-schema-generators/generator.ts',
          },
        ],
        documents: `query foo { f }`,
        generates: {
          './src/gql/': {
            preset: 'client',
            presetConfig: {
              schema: './test-files/schema.graphql',
            },
          },
        },
      });

      const fileOutput = output.find(file => file.filename === './src/gql/graphql.ts');
      expect(fileOutput.content).toContain(`test: Scalars['String']`);
    });

    it('Should generate a schema with client-preset', async () => {
      const output = await executeCodegen({
        schema: [
          SIMPLE_TEST_SCHEMA,
          {
            'delayed-schema-generator': () => `extend type Query { test: String! }`,
          },
        ],
        documents: `query foo { f }`,
        generates: {
          './src/gql/': {
            preset: 'client',
          },
        },
      });

      const fileOutput = output.find(file => file.filename === './src/gql/graphql.ts');
      expect(fileOutput.content).toContain(`test: Scalars['String']`);
    });

    it('Should generate a schema using the config option', async () => {
      const output = await executeCodegen({
        schema: [
          SIMPLE_TEST_SCHEMA,
          {
            'delayed-schema-generator': ({ config }) => `extend type Query { ${config.fieldName}: String! }`,
          },
        ],
        config: { fieldName: 'myField' },
        documents: `query foo { f }`,
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain(`myField: Scalars['String']`);
    });

    it('Should generate a schema depending on documents ', async () => {
      const testSchema = `type UserType { field: String! } type Query { user: UserType! }`;
      const testDocuments = `query MyQuery { user @useMyTool { field } }`;
      const directiveName = 'useMyTool';
      const localOnlyFieldName = 'localOnlyFieldForMyTool';

      // This document transform will add a local-only field to any field that has the @useMyTool directive.
      // For example:
      //   Before: query MyQuery { user @useMyTool { field } }
      //   After:  query MyQuery { user @useMyTool { field localOnlyFieldForMyTool @client } }
      const documentTransform: Types.DocumentTransformObject = {
        transform: ({ documents }) => {
          return documents.map(documentFile => {
            documentFile.document = visit(documentFile.document, {
              Field: {
                leave(fieldNode) {
                  if (!fieldNode.directives) return undefined;
                  const addFieldDirective = fieldNode.directives.find(
                    directive => directive.name.value === directiveName
                  );
                  if (!addFieldDirective) return undefined;

                  const localOnlyField: FieldNode = {
                    kind: Kind.FIELD,
                    name: { kind: Kind.NAME, value: localOnlyFieldName },
                    directives: [{ kind: Kind.DIRECTIVE, name: { kind: Kind.NAME, value: 'client' } }],
                  };

                  return {
                    ...fieldNode,
                    selectionSet: {
                      ...fieldNode.selectionSet!,
                      selections: [...fieldNode.selectionSet!.selections, localOnlyField],
                    },
                  };
                },
              },
            });
            return documentFile;
          });
        },
      };

      // This generates a schema that adds a local-only field type.
      // For example: extend type UserType { localOnlyFieldForMyTool: String! }
      const schemaGenerator = ({ schemaAst, documents }) => {
        const typeInfo = new TypeInfo(schemaAst);
        const typeNames = [];
        visit(
          concatAST(documents.map(file => file.document)),
          visitWithTypeInfo(typeInfo, {
            Field: {
              leave(fieldNode) {
                if (!fieldNode.directives) return;
                const addFieldDirective = fieldNode.directives.find(
                  directive => directive.name.value === directiveName
                );
                if (!addFieldDirective) return;

                const type = typeInfo.getType();
                if (isNonNullType(type) && isObjectType(type.ofType)) {
                  typeNames.push(type.ofType.name);
                }
              },
            },
          })
        );
        if (typeNames.length > 0) {
          return typeNames.map(name => `extend type ${name} { ${localOnlyFieldName}: String! }`).join('\n');
        }
        return '';
      };

      const output = await executeCodegen({
        schema: [testSchema, { 'delayed-schema-generator': schemaGenerator }],
        documents: testDocuments,
        generates: {
          'out1.ts': {
            plugins: ['typescript', 'typescript-operations'],
            documentTransforms: [documentTransform],
          },
        },
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain(`localOnlyFieldForMyTool: Scalars['String'];`);
      expect(output[0].content).toContain(
        `export type MyQueryQuery = { __typename?: 'Query', user: { __typename?: 'UserType', field: string, localOnlyFieldForMyTool: string } };`
      );
    });
  });
});
