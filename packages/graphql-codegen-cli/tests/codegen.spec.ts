import { makeExecutableSchema } from 'graphql-tools';
import { executeCodegen } from '../src/codegen';
import { mergeSchemas, buildSchema } from '../src/merge-schemas';
import { GraphQLObjectType, parse, print } from 'graphql';
import { FileOutput } from 'graphql-codegen-core';

const SHOULD_NOT_THROW_STRING = 'SHOULD_NOT_THROW';
const SIMPLE_TEST_SCHEMA = `type MyType { f: String } type Query { f: String }`;

describe('Codegen Executor', () => {
  describe('Generator General Options', () => {
    it('Should output the correct filenames', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': ['typescript-common'],
          'out2.ts': ['typescript-common']
        }
      });

      expect(output.length).toBe(2);
      expect(output[0].filename).toBe('out1.ts');
      expect(output[1].filename).toBe('out2.ts');
    });

    it('Should load require extensions', async () => {
      expect((global as any).dummyWasLoaded).toBeFalsy();
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        require: '../tests/dummy-require.js',
        generates: {
          'out1.ts': ['typescript-common']
        }
      });

      expect(output.length).toBe(1);
      expect((global as any).dummyWasLoaded).toBeTruthy();
    });

    it('Should throw when require extension is invalid', async () => {
      try {
        await executeCodegen({
          schema: SIMPLE_TEST_SCHEMA,
          require: 'tests/missing.js',
          generates: {
            'out1.ts': ['typescript-common']
          }
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
            plugins: {
              'typescript-client': {},
              'typescript-server': {}
            }
          }
        }
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export namespace Root');
      expect(output[0].content).toContain('export interface Query');
    });

    it('Should accept plugins as arrat of objects', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: [{ 'typescript-client': {} }, { 'typescript-server': {} }]
          }
        }
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export namespace Root');
      expect(output[0].content).toContain('export interface Query');
    });

    it('Should throw when no output files has been specified', async () => {
      try {
        await executeCodegen({
          schema: SIMPLE_TEST_SCHEMA,
          generates: {}
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
        expect(e.message).toBe('Invalid Codegen Configuration!');
      }
    });

    it('Should work with just schema', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out.ts': ['typescript-common', 'typescript-server']
        }
      });

      expect(output.length).toBe(1);
    });

    it('Should not throw when every output has a schema and there is no root schema', async () => {
      try {
        const output = await executeCodegen({
          generates: {
            'out.ts': {
              schema: SIMPLE_TEST_SCHEMA,
              plugins: ['typescript-common', 'typescript-server']
            }
          }
        } as any);

        expect(output.length).toBe(1);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
        expect(e.message).not.toBe('Invalid Codegen Configuration!');
      }
    });

    it('Should throw when there is no root schema and some outputs have not defined its own schema', async () => {
      try {
        await executeCodegen({
          generates: {
            'out.ts': ['typescript-common', 'typescript-server']
          }
        } as any);

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).toBe('Invalid Codegen Configuration!');
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
      }
    });

    it('Should throw when one output has no plugins defined', async () => {
      try {
        await executeCodegen({
          generates: {
            'out.ts': []
          }
        } as any);

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
        expect(e.message).toBe('Invalid Codegen Configuration!');
      }
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
            plugins: ['typescript-common', 'typescript-server']
          }
        }
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export interface Query');
      expect(output[0].content).toContain('export interface MyType');
      expect(output[0].content).toContain('export interface OtherType');
    });

    it('Should allow to specify documents extension for specific output', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': {
            documents: `query q { f }`,
            plugins: ['typescript-client']
          }
        }
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export namespace Q');
    });

    it('Should extend existing documents', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            documents: `query q { f }`,
            plugins: ['typescript-client']
          }
        }
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export namespace Q');
      expect(output[0].content).toContain('export namespace Root');
    });

    it('Should be able to use root schema object (in apollo-angular)', async () => {
      let output: FileOutput[];

      try {
        output = await executeCodegen({
          schema: `
            type RootQuery { f: String }
            schema { query: RootQuery }
          `,
          documents: `query q { f }`,
          generates: {
            'out1.ts': ['typescript-common', 'typescript-client', 'typescript-apollo-angular']
          }
        });
      } catch (e) {
        throw new Error(SHOULD_NOT_THROW_STRING);
      }

      expect(output.length).toBe(1);
      expect(output[0].filename).toBe('out1.ts');
    });

    it('Should throw on duplicated names', async () => {
      try {
        await executeCodegen({
          schema: `
            type RootQuery { f: String }
            schema { query: RootQuery }
          `,
          documents: [`query q { f }`, `query q { f }`],
          generates: {
            'out1.ts': ['typescript-common']
          }
        });
        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e).not.toEqual(SHOULD_NOT_THROW_STRING);
        expect(e.errors[0].message).toContain('Not all operations have an unique name: q');
      }
    });

    it('should handle gql tag in ts with with nested fragment', async () => {
      const result = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: ['./tests/test-documents/my-fragment.ts', './tests/test-documents/query-with-my-fragment.ts'],
        generates: {
          'out1.ts': ['typescript-common', 'typescript-client']
        }
      });
      expect(result[0].content).toContain('MyQuery');
      expect(result[0].filename).toEqual('out1.ts');
    });

    it('should handle gql tag in ts with with multiple nested fragment', async () => {
      const result = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: ['./tests/test-documents/my-fragment.ts', './tests/test-documents/query-with-my-fragment.ts'],
        generates: {
          'out1.ts': ['typescript-common', 'typescript-client']
        }
      });

      expect(result[0].content).toContain('MyQuery');
      expect(result[0].filename).toEqual('out1.ts');
    });

    it('should handle gql tag in js with with nested fragment', async () => {
      const result = await executeCodegen({
        schema: ['./tests/test-documents/schema.graphql'],
        documents: ['./tests/test-documents/js-query-with-my-fragment.js', './tests/test-documents/js-my-fragment.js'],
        generates: {
          'out1.ts': ['typescript-common', 'typescript-client']
        }
      });

      expect(result[0].content).toContain('MyQuery');
      expect(result[0].filename).toEqual('out1.ts');
    });
  });

  describe('Plugin Configuration', () => {
    it('Should inherit root config', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        config: {
          namingConvention: 'change-case#lowerCase'
        },
        generates: {
          'out1.ts': ['typescript-client']
        }
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export namespace root');
    });

    it('Should accept config in per-output', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            config: {
              namingConvention: 'change-case#lowerCase'
            },
            plugins: ['typescript-client']
          },
          'out2.ts': {
            config: {
              namingConvention: 'change-case#upperCase'
            },
            plugins: ['typescript-client']
          }
        }
      });

      expect(output.length).toBe(2);
      expect(output[0].content).toContain('export namespace root');
      expect(output[1].content).toContain('export namespace ROOT');
    });

    it('Should accept config in per-plugin', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        generates: {
          'out1.ts': {
            plugins: [
              {
                'typescript-client': {
                  namingConvention: 'change-case#lowerCase'
                }
              },
              {
                'typescript-server': {}
              }
            ]
          }
        }
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('export namespace root');
      expect(output[0].content).not.toContain('export namespace oot');
      expect(output[0].content).toContain('export interface Query');
      expect(output[0].content).not.toContain('export interface query');
    });

    it('Should allow override of config in', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        documents: `query root { f }`,
        config: {
          namingConvention: 'change-case#lowerCase'
        },
        generates: {
          'out1.ts': {
            plugins: [
              {
                'typescript-client': {
                  namingConvention: 'change-case#upperCase'
                }
              }
            ]
          },
          'out2.ts': {
            plugins: [
              {
                'typescript-client': {
                  namingConvention: 'change-case#pascalCase'
                }
              }
            ]
          }
        }
      });

      expect(output.length).toBe(2);
      expect(output[0].content).toContain('export namespace ROOT');
      expect(output[1].content).toContain('export namespace Root');
    });
  });

  describe('Plugin loading', () => {
    it('Should load custom plugin from local file', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': ['./tests/custom-plugins/basic.js']
        }
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('plugin');
    });

    it('Should throw when custom plugin is not valid', async () => {
      try {
        await executeCodegen({
          schema: SIMPLE_TEST_SCHEMA,
          generates: {
            'out1.ts': ['./tests/custom-plugins/invalid.js']
          }
        });
        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
        expect(e.errors[0].message).toContain('Invalid Custom Plugin');
        expect(e.errors[0].details).toContain('does not export a valid JS object with');
      }
    });

    it('Should execute custom plugin validation and throw when it fails', async () => {
      try {
        await executeCodegen({
          schema: SIMPLE_TEST_SCHEMA,
          generates: {
            'out1.ts': ['./tests/custom-plugins/validation.js']
          }
        });
        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (e) {
        expect(e.message).not.toBe(SHOULD_NOT_THROW_STRING);
        expect(e.errors[0].message).toContain('validation failed');
        expect(e.errors[0].details).toContain('Invalid!');
      }
    });

    it('Should allow plugins to extend schema', async () => {
      const output = await executeCodegen({
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          'out1.ts': ['./tests/custom-plugins/extends-schema.js', './tests/custom-plugins/checks-extended-schema.js']
        }
      });

      expect(output[0].content).toContain('MyType,');
      expect(output[0].content).toContain('Extension');
      expect(output[0].content).toContain(`Should have the Extension type: 'Extension'`);
    });
  });

  describe('Schema Merging', () => {
    it('should keep definitions of all directives', async () => {
      const merged = buildSchema(
        await mergeSchemas([
          makeExecutableSchema({ typeDefs: SIMPLE_TEST_SCHEMA }),
          makeExecutableSchema({
            typeDefs: `
            directive @id on FIELD_DEFINITION

            type Post {
              id: String @id
            }
          `
          })
        ])
      );

      expect(merged.getDirectives().map(({ name }) => name)).toContainEqual('id');
    });

    it('should keep directives in types', async () => {
      const merged = buildSchema(
        await mergeSchemas([
          makeExecutableSchema({ typeDefs: SIMPLE_TEST_SCHEMA }),
          makeExecutableSchema({
            typeDefs: `
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
          `
          })
        ])
      );

      expect(merged.getType('Post').astNode.directives.map(({ name }) => name.value)).toContainEqual('test');
      expect(
        (merged.getType('Post') as GraphQLObjectType).getFields()['id'].astNode.directives.map(({ name }) => name.value)
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

      const merged = await mergeSchemas([schemaA, schemaB, schemaC]);

      expect(print(merged)).toContain('scalar UniqueID');
      expect(print(merged)).toContain('scalar NotUniqueID');

      const schema = buildSchema(merged);

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
            plugins: ['typescript-common']
          }
        }
      });

      expect(output.length).toBe(1);
      expect(output[0].content).toContain('type UniqueId = any');
    });
  });

  describe('Custom schema loader', () => {
    it('Should allow custom loaders to load schema on root level', async () => {
      await executeCodegen({
        schema: [
          {
            './tests/test-documents/schema.graphql': {
              loader: '../tests/custom-loaders/custom-schema-loader.js'
            }
          }
        ],
        generates: {
          'out1.ts': ['typescript-common']
        }
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
                  loader: '../tests/custom-loaders/custom-schema-loader.js'
                }
              }
            ],
            plugins: ['typescript-common']
          }
        }
      });

      expect((global as any).CUSTOM_SCHEMA_LOADER_CALLED).toBeTruthy();
    });

    it('Should throw when invalid return value from loader', async () => {
      try {
        await executeCodegen({
          schema: [
            {
              './tests/test-documents/schema.graphql': {
                loader: '../tests/custom-loaders/invalid-return-value-schema-loader.js'
              }
            }
          ],
          generates: {
            'out1.ts': ['typescript-common']
          }
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (listrError) {
        const e = listrError.errors[0];
        expect(e.message).toBe('Failed to load custom schema loader');
        expect(e.details).toContain('Return value of a custom schema loader must be of type');
      }
    });

    it('Should throw when invalid module specified as loader', async () => {
      try {
        await executeCodegen({
          schema: [
            {
              './tests/test-documents/schema.graphql': {
                loader: '../tests/custom-loaders/non-existing.js'
              }
            }
          ],
          generates: {
            'out1.ts': ['typescript-common']
          }
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (listrError) {
        const e = listrError.errors[0];
        expect(e.message).toBe('Failed to load custom schema loader');
        expect(e.details).toContain('Cannot find module');
      }
    });

    it('Should throw when invalid file declaration', async () => {
      try {
        await executeCodegen({
          schema: [
            {
              './tests/test-documents/schema.graphql': {
                loader: '../tests/custom-loaders/invalid-export.js'
              }
            }
          ],
          generates: {
            'out1.ts': ['typescript-common']
          }
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (listrError) {
        const e = listrError.errors[0];
        expect(e.message).toBe('Failed to load custom schema loader');
        expect(e.details).toContain(
          'Unable to find a loader function! Make sure to export a default function from your file'
        );
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
              loader: '../tests/custom-loaders/custom-documents-loader.js'
            }
          }
        ],
        generates: {
          'out1.ts': ['typescript-common']
        }
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
                  loader: '../tests/custom-loaders/custom-documents-loader.js'
                }
              }
            ],
            plugins: ['typescript-common']
          }
        }
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
                loader: '../tests/custom-loaders/invalid-return-value-documents-loader.js'
              }
            }
          ],
          generates: {
            'out1.ts': ['typescript-common']
          }
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (listrError) {
        const e = listrError.errors[0];
        expect(e.message).toBe('Failed to load custom documents loader');
        expect(e.details).toContain('Return value of a custom schema loader must be an Array of');
      }
    });

    it('Should throw when invalid module specified as loader', async () => {
      try {
        await executeCodegen({
          schema: ['./tests/test-documents/schema.graphql'],
          documents: [
            {
              './tests/test-documents/valid.graphql': {
                loader: '../tests/custom-loaders/non-existing.js'
              }
            }
          ],
          generates: {
            'out1.ts': ['typescript-common']
          }
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (listrError) {
        const e = listrError.errors[0];
        expect(e.message).toBe('Failed to load custom documents loader');
        expect(e.details).toContain('Cannot find module');
      }
    });

    it('Should throw when invalid file declaration', async () => {
      try {
        await executeCodegen({
          schema: ['./tests/test-documents/schema.graphql'],
          documents: [
            {
              './tests/test-documents/valid.graphql': {
                loader: '../tests/custom-loaders/invalid-export.js'
              }
            }
          ],
          generates: {
            'out1.ts': ['typescript-common']
          }
        });

        throw new Error(SHOULD_NOT_THROW_STRING);
      } catch (listrError) {
        const e = listrError.errors[0];
        expect(e.message).toBe('Failed to load custom documents loader');
        expect(e.details).toContain(
          'Unable to find a loader function! Make sure to export a default function from your file'
        );
      }
    });
  });
});
