import '@graphql-codegen/testing';
import { extendSchema, parse, printSchema, type GraphQLUnionType } from 'graphql';
// import * as add from '@graphql-codegen/add';
import {
  getCachedDocumentNodeFromSchema,
  type CodegenPlugin,
} from '@graphql-codegen/plugin-helpers';
import * as typescriptOperations from '@graphql-codegen/typescript-operations';
import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { executeCodegen } from '../src/index.js';
import { getLogger } from '../src/utils/logger.js';

const warnSpy = vi.spyOn(getLogger(), 'warn').mockImplementation(() => {});

describe('Array `generates` value', () => {
  beforeEach(() => {
    warnSpy.mockReset();
  });

  it('runs multiple elements as stages in order, appending to the same file, without warning', async () => {
    const { result } = await executeCodegen({
      schema: /* GraphQL */ `
        type Query {
          f: String
        }
      `,
      generates: {
        'out.ts': [
          { plugins: [{ add: { content: '// FIRST_ELEMENT' } }] },
          { plugins: [{ add: { content: '// SECOND_ELEMENT' } }] },
        ],
        'out2.ts': [
          { plugins: [{ add: { content: '// THIRD_ELEMENT' } }] },
          { plugins: [{ add: { content: '// FOURTH_ELEMENT' } }] },
        ],
      },
    });

    expect(result.length).toBe(2);
    expect(result[0].filename).toBe('out.ts');
    expect(result[0].content).toBe('// FIRST_ELEMENT\n// SECOND_ELEMENT');
    expect(result[1].filename).toBe('out2.ts');
    expect(result[1].content).toBe('// THIRD_ELEMENT\n// FOURTH_ELEMENT');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('throws when an element uses a preset and there are multiple elements', async () => {
    await expect(
      executeCodegen({
        schema: /* GraphQL */ `
          type Query {
            f: String
          }
        `,
        generates: {
          'out/': [
            { preset: 'client', plugins: [] },
            { plugins: [{ add: { content: '// SECOND_ELEMENT' } }] },
          ],
        },
      }),
    ).rejects.toThrow('Presets are not supported yet');
  });
});

describe('`pluginContext.output` shared by the stages', () => {
  it('lets a later stage receive the schema extended by an earlier stage', async () => {
    const { result, error } = await executeCodegen({
      schema: /* GraphQL */ `
        type Query {
          user: User
        }
        type User {
          id: ID!
        }

        type ResponseError {
          error: String!
        }
      `,
      documents: /* GraphQL */ `
        query User {
          user {
            ... on User {
              id
            }
            ... on ResponseError {
              __typename
            }
          }
        }
      `,
      pluginLoader: name => {
        const plugins: Record<string, CodegenPlugin> = {
          '@graphql-codegen/extend-schema': {
            plugin: schema => {
              const extendedSchema = extendSchema(
                schema,
                parse(/* GraphQL */ `
                  union UserResponse = User | ResponseError
                `),
              );
              // `extendSchema` cannot change an existing field, so retype `Query.user` separately
              const userResponseSchema = mapSchema(extendedSchema, {
                [MapperKind.ROOT_FIELD]: (fieldConfig, fieldName) =>
                  fieldName === 'user'
                    ? {
                        ...fieldConfig,
                        type: extendedSchema.getType('UserResponse') as GraphQLUnionType,
                      }
                    : fieldConfig,
              });
              return {
                content: '',
                schema: getCachedDocumentNodeFromSchema(userResponseSchema),
              };
            },
          },
          '@graphql-codegen/print-schema': {
            plugin: schema => ({ content: `/* Extended schema\n${printSchema(schema)}\n*/\n` }),
          },
          '@graphql-codegen/typescript-operations': typescriptOperations,
        };
        return plugins[name];
      },
      generates: {
        'out.ts': [
          { plugins: ['extend-schema'], config: { skipDocumentsValidation: true } }, // skipDocumentsValidation=true is required because the document is not valid without the extended schema
          { plugins: ['print-schema'] },
          { plugins: ['typescript-operations'] },
        ],
      },
    });

    expect(error).toBeNull();
    expect(result[0].content).toMatchInlineSnapshot(`
      "/** Internal type. DO NOT USE DIRECTLY. */
      type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
      /** Internal type. DO NOT USE DIRECTLY. */
      export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
      /* Extended schema
      type Query {
        user: UserResponse
      }

      type ResponseError {
        error: String!
      }

      type User {
        id: ID!
      }

      union UserResponse = User | ResponseError
      */

      export type UserQueryVariables = Exact<{ [key: string]: never; }>;


      export type UserQuery = { user:
          | { id: string }
          | { __typename: 'ResponseError' }
         | null };
      "
    `);
  });

  // describe('with meta plugins', () => {
  //   const plugins: Record<string, CodegenPlugin> = {
  //     '@graphql-codegen/add': add,
  //     '@graphql-codegen/producer': {
  //       plugin: (_schema, _documents, config) => ({
  //         content: config.content,
  //         prepend: config.prepend,
  //         append: config.append,
  //         meta: config.meta,
  //       }),
  //     },
  //     '@graphql-codegen/consumer': {
  //       plugin: (_schema, _documents, _config, info) =>
  //         `// CONSUMER: ${JSON.stringify(info?.pluginContext?.output)}`,
  //     },
  //   };
  //   const readConsumerOutput = ({ content }: { content: string }): unknown =>
  //     JSON.parse(content.split('// CONSUMER: ')[1].split('\n')[0]);

  //   it('gives the first stage empty files', async () => {
  //     const { result, error } = await executeCodegen({
  //       schema: /* GraphQL */ `
  //         type Query {
  //           f: String
  //         }
  //       `,
  //       pluginLoader: name => plugins[name],
  //       generates: {
  //         'out.ts': [{ plugins: ['consumer'] }, { plugins: [{ add: { content: '// TWO' } }] }],
  //       },
  //     });

  //     expect(error).toBeNull();
  //     expect(readConsumerOutput({ content: result[0].content })).toEqual({ files: {} });
  //   });

  //   it('lets the meta of a later stage win on a collision', async () => {
  //     const { result, error } = await executeCodegen({
  //       schema: /* GraphQL */ `
  //         type Query {
  //           f: String
  //         }
  //       `,
  //       pluginLoader: name => plugins[name],
  //       generates: {
  //         'out.ts': [
  //           { plugins: [{ producer: { content: '// ONE', meta: { a: 1, b: 1 } } }] },
  //           { plugins: [{ producer: { content: '// TWO', meta: { b: 2 } } }] },
  //           { plugins: ['consumer'] },
  //         ],
  //       },
  //     });

  //     expect(error).toBeNull();
  //     expect(readConsumerOutput({ content: result[0].content })).toMatchObject({
  //       files: { 'out.ts': { content: '// ONE\n// TWO' } },
  //       a: 1,
  //       b: 2,
  //     });
  //   });

  //   it('writes the prepend lines of all stages, then their content in order, then their append lines', async () => {
  //     const { result, error } = await executeCodegen({
  //       schema: /* GraphQL */ `
  //         type Query {
  //           f: String
  //         }
  //       `,
  //       pluginLoader: name => plugins[name],
  //       generates: {
  //         'out.ts': [
  //           {
  //             plugins: [
  //               {
  //                 producer: {
  //                   content: '// ONE',
  //                   prepend: ['// HEADER'],
  //                   append: ['// END_ONE'],
  //                 },
  //               },
  //             ],
  //           },
  //           {
  //             plugins: [
  //               {
  //                 producer: {
  //                   content: '// TWO',
  //                   prepend: ['import b from "b";', '// HEADER'],
  //                   append: ['// END_TWO'],
  //                 },
  //               },
  //             ],
  //           },
  //         ],
  //       },
  //     });

  //     expect(error).toBeNull();
  //     expect(result[0].content).toBe(
  //       '// HEADER\nimport b from "b";\n// ONE\n// TWO\n// END_ONE\n// END_TWO',
  //     );
  //   });

  //   it("writes a single stage's file and does not give it `output`", async () => {
  //     const { result, error } = await executeCodegen({
  //       schema: /* GraphQL */ `
  //         type Query {
  //           f: String
  //         }
  //       `,
  //       pluginLoader: name => plugins[name],
  //       generates: {
  //         'out.ts': {
  //           plugins: [
  //             {
  //               producer: {
  //                 content: '// ONE',
  //                 prepend: ['import a from "a";', '// HEADER'],
  //                 append: ['// END'],
  //               },
  //             },
  //             'consumer',
  //           ],
  //         },
  //       },
  //     });

  //     expect(error).toBeNull();
  //     expect(result[0].content).toBe(
  //       '// HEADER\nimport a from "a";\n// ONE\n// CONSUMER: undefined\n// END',
  //     );
  //   });
  // });
});

// describe('schema and documents returned by a stage', () => {
//   const producer: CodegenPlugin = {
//     plugin: async (schema, documents, config) => {
//       if (config.delay) {
//         await new Promise(resolve => setTimeout(resolve, config.delay));
//       }
//       const transformedSchema = config.addType
//         ? getCachedDocumentNodeFromSchema(
//             extendSchema(schema, parse(`type ${config.addType} { id: ID }`)),
//           )
//         : undefined;
//       return {
//         content: `// PRODUCER: ${config.addType || ''} ${config.addDocument || ''}`,
//         // `returnSchemaAst` returns the transformed schema under `schemaAst`, which later stages ignore
//         [config.returnSchemaAst ? 'schemaAst' : 'schema']: transformedSchema,
//         documents: config.addDocument
//           ? [
//               ...documents,
//               {
//                 location: `${config.addDocument}.graphql`,
//                 document: parse(`query ${config.addDocument} { f }`),
//               },
//             ]
//           : undefined,
//       };
//     },
//   };
//   const plugins: Record<string, CodegenPlugin> = {
//     '@graphql-codegen/add': add,
//     '@graphql-codegen/producer': producer,
//     // Same plugin under another name, so one stage can list it twice
//     '@graphql-codegen/producer-alt': producer,
//     '@graphql-codegen/consumer': {
//       plugin: (schema, documents) => {
//         const typeNames = Object.keys(schema.getTypeMap())
//           .filter(name => !name.startsWith('__'))
//           .sort();
//         const locations = documents.map(document => document.location);
//         return `// CONSUMER: types=${typeNames.join(',')} documents=${locations.join(',')}`;
//       },
//     },
//   };
//   const LOADED_TYPES = 'Boolean,Query,String';

//   it('forwards a returned schema to the next stage', async () => {
//     const { result, error } = await executeCodegen({
//       schema: /* GraphQL */ `
//         type Query {
//           f: String
//         }
//       `,
//       pluginLoader: name => plugins[name],
//       generates: {
//         'out.ts': [{ plugins: [{ producer: { addType: 'Added' } }] }, { plugins: ['consumer'] }],
//       },
//     });

//     expect(error).toBeNull();
//     expect(result[0].content).toBe(
//       `// PRODUCER: Added \n// CONSUMER: types=Added,Boolean,ID,Query,String documents=`,
//     );
//   });

//   it('does not forward a schema returned as `schemaAst`', async () => {
//     const { result, error } = await executeCodegen({
//       schema: /* GraphQL */ `
//         type Query {
//           f: String
//         }
//       `,
//       pluginLoader: name => plugins[name],
//       generates: {
//         'out.ts': [
//           { plugins: [{ producer: { addType: 'Added', returnSchemaAst: true } }] },
//           { plugins: ['consumer'] },
//         ],
//       },
//     });

//     expect(error).toBeNull();
//     expect(result[0].content).toBe(
//       `// PRODUCER: Added \n// CONSUMER: types=${LOADED_TYPES} documents=`,
//     );
//   });

//   it('forwards returned documents to the next stage', async () => {
//     const { result, error } = await executeCodegen({
//       schema: /* GraphQL */ `
//         type Query {
//           f: String
//         }
//       `,
//       pluginLoader: name => plugins[name],
//       generates: {
//         'out.ts': [
//           { plugins: [{ producer: { addDocument: 'Added' } }] },
//           { plugins: ['consumer'] },
//         ],
//       },
//     });

//     expect(error).toBeNull();
//     expect(result[0].content).toBe(
//       `// PRODUCER:  Added\n// CONSUMER: types=${LOADED_TYPES} documents=Added.graphql`,
//     );
//   });

//   it('passes the schema and documents through a stage that returns neither', async () => {
//     const { result, error } = await executeCodegen({
//       schema: /* GraphQL */ `
//         type Query {
//           f: String
//         }
//       `,
//       pluginLoader: name => plugins[name],
//       generates: {
//         'out.ts': [
//           { plugins: [{ producer: { addType: 'Added', addDocument: 'Added' } }] },
//           { plugins: [{ add: { content: '// MIDDLE' } }] },
//           { plugins: ['consumer'] },
//         ],
//       },
//     });

//     expect(error).toBeNull();
//     // `add` puts its content in `prepend` by default, so it comes before the content of all stages
//     expect(result[0].content).toBe(
//       '// MIDDLE\n// PRODUCER: Added Added\n// CONSUMER: types=Added,Boolean,ID,Query,String documents=Added.graphql',
//     );
//   });

//   it('gives the first stage, and other plugins of the returning stage, the loaded schema and documents', async () => {
//     const { result, error } = await executeCodegen({
//       schema: /* GraphQL */ `
//         type Query {
//           f: String
//         }
//       `,
//       documents: 'query Loaded { f }',
//       pluginLoader: name => plugins[name],
//       generates: {
//         'out.ts': [
//           { plugins: ['consumer', { producer: { addType: 'Added', addDocument: 'Added' } }] },
//           { plugins: ['consumer'] },
//         ],
//       },
//     });

//     expect(error).toBeNull();
//     const [firstStageConsumer, , secondStageConsumer] = result[0].content.split('\n');
//     expect(firstStageConsumer).toMatch(
//       new RegExp(`^// CONSUMER: types=${LOADED_TYPES} documents=[^,]+$`),
//     );
//     expect(secondStageConsumer).toMatch(
//       /^\/\/ CONSUMER: types=Added,Boolean,ID,Query,String documents=[^,]+,Added\.graphql$/,
//     );
//   });

//   it('uses what the plugin listed last returns when several plugins of a stage return it', async () => {
//     const { result, error } = await executeCodegen({
//       schema: /* GraphQL */ `
//         type Query {
//           f: String
//         }
//       `,
//       pluginLoader: name => plugins[name],
//       generates: {
//         'out.ts': [
//           {
//             plugins: [
//               // finishes last, but is listed first
//               { producer: { addType: 'First', addDocument: 'First', delay: 20 } },
//               { 'producer-alt': { addType: 'Last', addDocument: 'Last' } },
//             ],
//           },
//           { plugins: ['consumer'] },
//         ],
//       },
//     });

//     expect(error).toBeNull();
//     expect(result[0].content).toContain(
//       '// CONSUMER: types=Boolean,ID,Last,Query,String documents=Last.graphql',
//     );
//   });
// });
