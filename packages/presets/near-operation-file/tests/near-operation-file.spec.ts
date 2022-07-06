import { executeCodegen } from '@graphql-codegen/cli';
import { getCachedDocumentNodeFromSchema, Types } from '@graphql-codegen/plugin-helpers';
import { generateFragmentImportStatement } from '@graphql-codegen/visitor-plugin-common';
import { buildASTSchema, buildSchema, parse } from 'graphql';
import path from 'path';
import { preset } from '../src/index.js';

describe('near-operation-file preset', () => {
  const schemaDocumentNode = parse(/* GraphQL */ `
    type Query {
      user(id: String): User!
    }

    type User {
      id: ID!
      profile: Profile!
      email: String!
      username: String!
    }

    type Profile {
      name: String!
      age: Int!
    }
  `);
  const schemaNode = buildASTSchema(schemaDocumentNode);
  const operationAst = parse(/* GraphQL */ `
    query {
      user {
        id
        ...UserFields
      }
    }
  `);
  const minimalOperationAst = parse(/* GraphQL */ `
    query {
      user {
        ...UserFields
      }
    }
  `);
  const fragmentAst = parse(/* GraphQL */ `
    fragment UserFields on User {
      id
      username
    }
  `);
  const testDocuments = [
    {
      location: '/some/deep/path/src/graphql/me-query.graphql',
      document: operationAst,
    },
    {
      location: '/some/deep/path/src/graphql/user-fragment.graphql',
      document: fragmentAst,
    },
    {
      location: '/some/deep/path/src/graphql/me.query.graphql',
      document: operationAst,
    },
    {
      location: '/some/deep/path/src/graphql/something-query.graphql',
      document: operationAst,
    },
    {
      location: '/some/deep/path/src/graphql/nested/somethingElse.graphql',
      document: operationAst,
    },
    {
      location: '/some/deep/path/src/graphql/nested/from-js.js',
      document: operationAst,
    },
    {
      location: '/some/deep/path/src/graphql/component.ts',
      document: operationAst,
    },
  ];

  describe('Issues', () => {
    it('#5002 - error when inline fragment does not specify the name of the type', async () => {
      const testSchema = parse(/* GraphQL */ `
        scalar Date

        schema {
          query: Query
        }

        type Query {
          me: User!
          user(id: ID!): User
          allUsers: [User]
          search(term: String!): [SearchResult!]!
          myChats: [Chat!]!
        }

        enum Role {
          USER
          ADMIN
        }

        interface Node {
          id: ID!
        }

        union SearchResult = User | Chat | ChatMessage

        type User implements Node {
          id: ID!
          username: String!
          email: String!
          role: Role!
        }

        type Chat implements Node {
          id: ID!
          users: [User!]!
          messages: [ChatMessage!]!
        }

        type ChatMessage implements Node {
          id: ID!
          content: String!
          time: Date!
          user: User!
        }
      `);

      const operations = [
        {
          location: 'test.graphql',
          document: parse(/* GraphQL */ `
            query chats {
              myChats {
                ...ChatFields
              }
            }

            fragment ChatFields on Chat {
              id
              ... @include(if: true) {
                id
                messages {
                  id
                }
              }
            }
          `),
        },
      ];

      expect(async () => {
        await preset.buildGeneratesSection({
          baseOutputDir: './src/',
          config: {},
          presetConfig: {
            folder: '__generated__',
            baseTypesPath: 'types.ts',
          },
          schema: testSchema,
          schemaAst: buildASTSchema(testSchema),
          documents: operations,
          plugins: [],
          pluginMap: {},
        });
      }).not.toThrow();
    });

    it('#3066 - should respect higher level of fragments usage, and ignore fragments per input', async () => {
      const doTest = async (operationsStr: string, expected: string) => {
        const testSchema = buildSchema(/* GraphQL */ `
          schema {
            query: Query
          }

          type Query {
            list: [Book]
            pages: [Page]
          }

          type Book {
            id: ID!
            title: String!
            pages: [Page!]!
          }

          type Page {
            id: ID!
            number: Int!
          }
        `);
        const result = await preset.buildGeneratesSection({
          baseOutputDir: './src/',
          config: {},
          presetConfig: {
            cwd: '/some/deep/path',
            baseTypesPath: 'types.ts',
          },
          schemaAst: testSchema,
          schema: getCachedDocumentNodeFromSchema(testSchema),
          documents: [
            {
              location: '/some/deep/path/src/graphql/queries.graphql',
              document: parse(operationsStr),
            },
            {
              location: '/some/deep/path/src/graphql/fragments.graphql',
              document: parse(/* GraphQL */ `
                fragment Page on Page {
                  id
                  number
                }

                fragment Book on Book {
                  id
                  title
                  pages {
                    ...Page
                  }
                }
              `),
            },
          ],
          plugins: [{ 'typescript-react-apollo': {} }],
          pluginMap: { 'typescript-react-apollo': {} as any },
        });

        expect(result[0].filename).toContain(`queries.generated.ts`);
        expect(getFragmentImportsFromResult(result)).toBe(expected);
      };

      await doTest(
        /* GraphQL */ `
          query Pages {
            pages {
              ...Page
            }
          }

          query List {
            list {
              ...Book
            }
          }
        `,
        `import { PageFragmentDoc, PageFragment, BookFragmentDoc, BookFragment } from './fragments.generated.js';`
      );

      // Try to flip the order of operations to see if it's still works
      await doTest(
        /* GraphQL */ `
          query List {
            list {
              ...Book
            }
          }

          query Pages {
            pages {
              ...Page
            }
          }
        `,
        `import { BookFragmentDoc, BookFragment, PageFragmentDoc, PageFragment } from './fragments.generated.js';`
      );
    });

    it('#2365 - Should not add Fragment suffix to import identifier when dedupeOperationSuffix: true', async () => {
      const result = await preset.buildGeneratesSection({
        baseOutputDir: './src/',
        config: {
          dedupeOperationSuffix: true,
        },
        presetConfig: {
          cwd: '/some/deep/path',
          baseTypesPath: 'types.ts',
        },
        schemaAst: schemaNode,
        schema: schemaDocumentNode,
        documents: [
          {
            location: '/some/deep/path/src/graphql/me-query.graphql',
            document: parse(/* GraphQL */ `
              query {
                user {
                  id
                  ...UserFieldsFragment
                }
              }
            `),
          },
          {
            location: '/some/deep/path/src/graphql/user-fragment.graphql',
            document: parse(/* GraphQL */ `
              fragment UserFieldsFragment on User {
                id
                username
              }
            `),
          },
        ],
        plugins: [{ 'typescript-react-apollo': {} }],
        pluginMap: { 'typescript-react-apollo': {} as any },
      });

      expect(result.map(o => o.plugins)[0]).toEqual(
        expect.arrayContaining([
          {
            add: {
              content: `import * as Types from '../types.js';\n`,
            },
          },
          {
            'typescript-react-apollo': {},
          },
        ])
      );

      expect(getFragmentImportsFromResult(result)).toContain(
        `import { UserFieldsFragmentDoc, UserFieldsFragment } from './user-fragment.generated.js';`
      );
    });

    it('#2365 - Should add Fragment suffix to import identifier when dedupeOperationSuffix not set', async () => {
      const result = await preset.buildGeneratesSection({
        baseOutputDir: './src/',
        config: {},
        presetConfig: {
          cwd: '/some/deep/path',
          baseTypesPath: 'types.ts',
        },
        schemaAst: schemaNode,
        schema: schemaDocumentNode,
        documents: [
          {
            location: '/some/deep/path/src/graphql/me-query.graphql',
            document: parse(/* GraphQL */ `
              query {
                user {
                  id
                  ...UserFieldsFragment
                }
              }
            `),
          },
          {
            location: '/some/deep/path/src/graphql/user-fragment.graphql',
            document: parse(/* GraphQL */ `
              fragment UserFieldsFragment on User {
                id
                username
              }
            `),
          },
        ],
        plugins: [{ 'typescript-react-apollo': {} }],
        pluginMap: { 'typescript-react-apollo': {} as any },
      });

      expect(result.map(o => o.plugins)[0]).toEqual(
        expect.arrayContaining([
          {
            add: {
              content: `import * as Types from '../types.js';\n`,
            },
          },
          {
            'typescript-react-apollo': {},
          },
        ])
      );

      expect(getFragmentImportsFromResult(result)).toContain(
        `import { UserFieldsFragmentFragmentDoc, UserFieldsFragmentFragment } from './user-fragment.generated.js';`
      );
    });

    it('#6439 - generating code only for the last query inside a file', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              a: String
              b: String
              c: String
            }
          `,
        ],
        documents: path.join(__dirname, 'fixtures/issue-6439.ts'),
        generates: {
          'out1.ts': {
            preset,
            presetConfig: {
              baseTypesPath: 'types.ts',
            },
            plugins: ['typescript-operations'],
          },
        },
      });

      expect(result[0].content).toMatchInlineSnapshot(`
        "import * as Types from '../../../../../out1.ts/types.js';

        export type AQueryVariables = Types.Exact<{ [key: string]: never; }>;


        export type AQuery = { __typename?: 'Query', a?: string | null };

        export type BQueryVariables = Types.Exact<{ [key: string]: never; }>;


        export type BQuery = { __typename?: 'Query', a?: string | null };

        export type CQueryVariables = Types.Exact<{ [key: string]: never; }>;


        export type CQuery = { __typename?: 'Query', a?: string | null };
        "
      `);
    });

    it('#6520 - self-importing fragment', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              user(id: String!): User!
            }

            type User {
              id: String!
              email: String
              username: String
            }
          `,
        ],
        documents: [path.join(__dirname, 'fixtures/issue-6520.ts')],
        generates: {
          'out1.ts': {
            preset,
            presetConfig: {
              baseTypesPath: 'types.ts',
            },
            plugins: ['typescript-operations', 'typescript-react-apollo'],
          },
        },
      });

      expect(result[0].content).not.toMatch(`import { UserFieldsFragmentDoc }`);
    });

    it('#6546 - duplicate fragment imports', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type Query {
              user(id: String!): User!
            }

            type User {
              id: String!
              email: String
              username: String
            }
          `,
        ],
        documents: [
          path.join(__dirname, 'fixtures/issue-6546-queries.ts'),
          path.join(__dirname, 'fixtures/issue-6546-fragments.ts'),
        ],
        generates: {
          'out1.ts': {
            preset,
            presetConfig: {
              baseTypesPath: 'types.ts',
            },
            plugins: ['typescript-operations', 'typescript-react-apollo'],
          },
        },
      });

      const queriesContent = result.find(generatedDoc => generatedDoc.filename.match(/issue-6546-queries/)).content;
      const imports = queriesContent.match(/import.*UsernameFragmentFragmentDoc/g);
      expect(imports).toHaveLength(1);
    });

    it('#7547 - importing root types when a fragment spread a fragment without any fields itself', async () => {
      const testSchema = buildSchema(/* GraphQL */ `
        enum Role {
          ADMIN
          USER
        }

        type User {
          id: ID!
          type: Role!
        }
      `);

      const result = await preset.buildGeneratesSection({
        baseOutputDir: './src/',
        config: {
          dedupeOperationSuffix: true,
        },
        presetConfig: {
          cwd: '/some/deep/path',
          baseTypesPath: 'types.ts',
        },
        schemaAst: testSchema,
        schema: getCachedDocumentNodeFromSchema(testSchema),
        documents: [
          {
            location: '/some/deep/path/src/graphql/a-fragment.gql',
            document: parse(/* GraphQL */ `
              fragment AFragment on User {
                ...BFragment
              }
            `),
          },
          {
            location: '/some/deep/path/src/graphql/b-fragment.graphql',
            document: parse(/* GraphQL */ `
              fragment BFragment on User {
                ...CFragment
              }
            `),
          },
          {
            location: '/some/deep/path/src/graphql/c-fragment.graphql',
            document: parse(/* GraphQL */ `
              fragment CFragment on User {
                id
                type
              }
            `),
          },
        ],
        plugins: [{ typescript: {} }],
        pluginMap: { typescript: {} as any },
      });

      for (const o of result) {
        expect(o.plugins).toEqual(
          expect.arrayContaining([{ add: { content: `import * as Types from '../types.js';\n` } }])
        );
      }
    });

    it('#7798 - importing type definitions of dependent fragments when `inlineFragmentType` is `mask`', async () => {
      const result = await executeCodegen({
        schema: [
          /* GraphQL */ `
            type User {
              id: ID!
              name: String!
            }

            type Query {
              user(id: ID!): User!
            }
          `,
        ],
        documents: [
          path.join(__dirname, 'fixtures/issue-7798-parent.ts'),
          path.join(__dirname, 'fixtures/issue-7798-child.ts'),
        ],
        generates: {
          'out1.ts': {
            preset,
            presetConfig: {
              baseTypesPath: 'types.ts',
            },
            plugins: ['typescript-operations'],
            config: { inlineFragmentTypes: 'mask' },
          },
        },
      });

      const parentContent = result.find(generatedDoc => generatedDoc.filename.match(/issue-7798-parent/)).content;
      const imports = parentContent.match(/import.*UserNameFragment/g);
      expect(imports).toHaveLength(1);
    });
  });

  it('should not add imports for fragments in the same location', async () => {
    const location = '/some/deep/path/src/graphql/me-query.graphql';
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {
        dedupeOperationSuffix: true,
      },
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: [
        {
          location,
          document: parse(/* GraphQL */ `
            query {
              user {
                id
                ...UserFieldsFragment
              }
            }
          `),
        },
        {
          location,
          document: parse(/* GraphQL */ `
            fragment UserFieldsFragment on User {
              id
              username
            }
          `),
        },
      ],
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });

    expect(getFragmentImportsFromResult(result)).toEqual('');
  });

  it('Should build the correct operation files paths', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: testDocuments,
      plugins: [],
      pluginMap: {},
    });

    expect(result.map(a => a.filename)).toEqual([
      '/some/deep/path/src/graphql/me-query.generated.ts',
      '/some/deep/path/src/graphql/user-fragment.generated.ts',
      '/some/deep/path/src/graphql/me.query.generated.ts',
      '/some/deep/path/src/graphql/something-query.generated.ts',
      '/some/deep/path/src/graphql/nested/somethingElse.generated.ts',
      '/some/deep/path/src/graphql/nested/from-js.generated.ts',
      '/some/deep/path/src/graphql/component.generated.ts',
    ]);
  });

  it('Should build the correct operation files paths with a subfolder', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        folder: '__generated__',
        baseTypesPath: 'types.ts',
      },
      schema: schemaDocumentNode,
      schemaAst: schemaNode,
      documents: testDocuments,
      plugins: [],
      pluginMap: {},
    });
    expect(result.map(a => a.filename)).toEqual([
      '/some/deep/path/src/graphql/__generated__/me-query.generated.ts',
      '/some/deep/path/src/graphql/__generated__/user-fragment.generated.ts',
      '/some/deep/path/src/graphql/__generated__/me.query.generated.ts',
      '/some/deep/path/src/graphql/__generated__/something-query.generated.ts',
      '/some/deep/path/src/graphql/nested/__generated__/somethingElse.generated.ts',
      '/some/deep/path/src/graphql/nested/__generated__/from-js.generated.ts',
      '/some/deep/path/src/graphql/__generated__/component.generated.ts',
    ]);
  });

  it('Should skip the duplicate documents validation', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        baseTypesPath: 'types.ts',
      },
      schema: schemaDocumentNode,
      schemaAst: schemaNode,
      documents: testDocuments,
      plugins: [],
      pluginMap: {},
    });

    expect(result[0].skipDocumentsValidation).toBeTruthy();
  });

  it('Should allow to customize output extension', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
        extension: '.flow.js',
      },
      schema: schemaDocumentNode,
      schemaAst: schemaNode,
      documents: testDocuments,
      plugins: [],
      pluginMap: {},
    });

    expect(result.map(a => a.filename)).toEqual([
      '/some/deep/path/src/graphql/me-query.flow.js',
      '/some/deep/path/src/graphql/user-fragment.flow.js',
      '/some/deep/path/src/graphql/me.query.flow.js',
      '/some/deep/path/src/graphql/something-query.flow.js',
      '/some/deep/path/src/graphql/nested/somethingElse.flow.js',
      '/some/deep/path/src/graphql/nested/from-js.flow.js',
      '/some/deep/path/src/graphql/component.flow.js',
    ]);
  });

  it('Should prepend the "add" plugin with the correct import', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schema: schemaDocumentNode,
      schemaAst: schemaNode,
      documents: testDocuments.slice(0, 2),
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.plugins)[0]).toEqual(
      expect.arrayContaining([
        {
          add: {
            content: `import * as Types from '../types.js';\n`,
          },
        },
      ])
    );
  });

  it('Should prepend the "add" plugin with the correct import when used with package name', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: '~@custom-package/types',
      },
      schema: schemaDocumentNode,
      schemaAst: schemaNode,
      documents: testDocuments.slice(0, 2),
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.plugins)[0]).toEqual(
      expect.arrayContaining([
        {
          add: {
            content: `import * as Types from '@custom-package/types';\n`,
          },
        },
      ])
    );
  });

  it('Should prepend the "add" plugin with the correct import, when only using fragment spread', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schema: schemaDocumentNode,
      schemaAst: schemaNode,
      documents: [
        { location: '/some/deep/path/src/graphql/me-query.graphql', document: minimalOperationAst },
        testDocuments[1],
      ],
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.plugins)[1]).toEqual(
      expect.arrayContaining([
        {
          add: {
            content: `import * as Types from '../types.js';\n`,
          },
        },
      ])
    );
  });

  it('should fail when multiple fragments with the same name but different definition are found', () => {
    expect(() =>
      preset.buildGeneratesSection({
        baseOutputDir: './src/',
        config: {},
        presetConfig: {
          cwd: '/some/deep/path',
          baseTypesPath: 'types.ts',
        },
        schema: schemaDocumentNode,
        schemaAst: schemaNode,
        documents: [
          testDocuments[1],
          {
            location: `/some/deep/path/src/graphql/user-fragment.graphql`,
            document: parse(/* GraphQL */ `
              fragment UserFields on User {
                id
              }
            `),
          },
        ],
        plugins: [{ typescript: {} }],
        pluginMap: { typescript: {} as any },
      })
    ).toThrow('Multiple fragments with the name(s) "UserFields" were found.');
  });

  it('should NOT fail when multiple fragments with the same name and definition are found', () => {
    expect(() =>
      preset.buildGeneratesSection({
        baseOutputDir: './src/',
        config: {},
        presetConfig: {
          cwd: '/some/deep/path',
          baseTypesPath: 'types.ts',
        },
        schema: schemaDocumentNode,
        schemaAst: schemaNode,
        documents: [testDocuments[1], testDocuments[1]],
        plugins: [{ typescript: {} }],
        pluginMap: { typescript: {} as any },
      })
    ).not.toThrow('Multiple fragments with the name(s) "UserFields" were found.');
  });

  it('Should NOT prepend the "add" plugin with Types import when selection set does not include direct fields', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: [
        {
          location: './test.graphql',
          document: parse(/* GraphQL */ `
            query {
              user {
                ...UserFields
              }
            }
          `),
        },
        testDocuments[1],
      ],
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });

    expect(result.map(o => o.plugins)[0]).not.toEqual(
      expect.arrayContaining([{ add: { content: `import * as Types from '../types.js';\n` } }])
    );
  });

  it('Should prepend the "add" plugin with Types import when arguments are used', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: [
        {
          location: './test.graphql',
          document: parse(/* GraphQL */ `
            query ($id: String) {
              user(id: $id) {
                ...UserFields
              }
            }
          `),
        },
        testDocuments[1],
      ],
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });

    expect(result.map(o => o.plugins)[0]).toEqual(
      expect.arrayContaining([
        {
          add: {
            content: `import * as Types from './src/types.js';\n`,
          },
        },
      ])
    );
  });

  it('Should prepend the "add" plugin with the correct import (long path)', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: [
        {
          location: '/some/deep/path/src/graphql/nested/here/me-query.graphql',
          document: operationAst,
        },
        testDocuments[1],
      ],
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });
    expect(result.map(o => o.plugins)[0]).toEqual(
      expect.arrayContaining([
        {
          add: {
            content: `import * as Types from '../../../types.js';\n`,
          },
        },
      ])
    );
  });

  it('Should prepend the "add" plugin with the correct import (siblings)', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: [
        {
          location: '/some/deep/path/src/me-query.graphql',
          document: operationAst,
        },
        testDocuments[1],
      ],
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });
    expect(result.map(o => o.plugins)[0]).toEqual(
      expect.arrayContaining([
        {
          add: {
            content: `import * as Types from './types.js';\n`,
          },
        },
      ])
    );
  });

  it('Should not generate an absolute path if the path starts with "~"', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: '~@internal/types',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: [
        {
          location: '/some/deep/path/src/me-query.graphql',
          document: operationAst,
        },
        testDocuments[1],
      ],
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });
    expect(result.map(o => o.plugins)[0]).toEqual(
      expect.arrayContaining([
        {
          add: {
            content: `import * as Types from '@internal/types';\n`,
          },
        },
      ])
    );
  });

  it('Should add "add" plugin to plugins map if its not there', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: testDocuments.slice(0, 2),
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });

    expect(result.map(o => o.pluginMap.add)[0]).toBeDefined();
  });

  it('Should add "namespacedImportName" to config', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: testDocuments.slice(0, 2),
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });

    expect(result.map(o => o.config.namespacedImportName)[0]).toBe('Types');
  });

  it('Should add import to external fragment when its in use', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: testDocuments.slice(0, 2),
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });

    expect(result.map(o => o.plugins)[0]).toEqual(
      expect.arrayContaining([
        {
          add: {
            content: `import * as Types from '../types.js';\n`,
          },
        },
        {
          'typescript-react-apollo': {},
        },
      ])
    );

    expect(getFragmentImportsFromResult(result)).toContain(
      `import { UserFieldsFragmentDoc, UserFieldsFragment } from './user-fragment.generated.js';`
    );
  });

  it('Should allow external fragments to be imported from packages with function', async () => {
    const spy = jest.fn();
    await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: '~@types',
        importAllFragmentsFrom: spy.mockReturnValue(false),
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: testDocuments.slice(0, 2),
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });

    expect(spy.mock.calls.length).toBe(1);
    expect(spy.mock.calls[0][1]).toBe('/some/deep/path/src/graphql/me-query.generated.ts');
    expect(spy.mock.calls[0][0].path).toBe('/some/deep/path/src/graphql/user-fragment.generated.ts');
  });

  it('Should allow external fragments to be imported from packages', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: '~@types',
        importAllFragmentsFrom: `~@fragments`,
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: testDocuments.slice(0, 2),
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });

    expect(result.map(o => o.plugins)[0]).toEqual(
      expect.arrayContaining([
        {
          add: {
            content: `import * as Types from '@types';\n`,
          },
        },
        {
          'typescript-react-apollo': {},
        },
      ])
    );

    expect(getFragmentImportsFromResult(result)).toContain(
      `import { UserFieldsFragmentDoc, UserFieldsFragment } from '@fragments';`
    );
  });

  it('Should add import to external fragment when its in use (long path)', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: [
        {
          location: '/some/deep/path/src/graphql/nested/down/here/me-query.graphql',
          document: operationAst,
        },
        testDocuments[1],
      ],
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });

    expect(getFragmentImportsFromResult(result)).toContain(
      `import { UserFieldsFragmentDoc, UserFieldsFragment } from '../../../user-fragment.generated.js';`
    );
  });

  it('Should add import to external fragment when its in use (nested fragment)', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path',
        baseTypesPath: 'types.ts',
      },
      schemaAst: schemaNode,
      schema: schemaDocumentNode,
      documents: [
        testDocuments[0],
        {
          location: '/some/deep/path/src/graphql/nested/down/here/user-fragment.graphql',
          document: fragmentAst,
        },
      ],
      plugins: [{ 'typescript-react-apollo': {} }],
      pluginMap: { 'typescript-react-apollo': {} as any },
    });

    expect(getFragmentImportsFromResult(result)).toContain(
      `import { UserFieldsFragmentDoc, UserFieldsFragment } from './nested/down/here/user-fragment.generated.js';`
    );
  });

  it('Should import relevant fragments on dedupeFragments', async () => {
    const testSchema = parse(/* GraphQL */ `
      schema {
        query: Query
      }

      type Query {
        animals: [Animal!]!
      }

      type Group {
        id: ID!
        name: String!
      }
      type Animal {
        id: ID!
        name: String!
        group: Group
      }
    `);

    const operations = [
      {
        location: '/operations/document.graphql',
        document: parse(/* GraphQL */ `
          #import "./fragments/MyAnimalFragment.graphql"

          query Test {
            animals {
              ...MyAnimalFragment
            }
          }
        `),
      },
      {
        location: '/operations/fragments/AnotherGroupFragment.graphql',
        document: parse(/* GraphQL */ `
          fragment AnotherGroupFragment on Group {
            id
          }
        `),
      },
      {
        location: '/operations/fragments/MyAnimalFragment.graphql',
        document: parse(/* GraphQL */ `
          #import "./MyGroupFragment.graphql"

          fragment MyAnimalFragment on Animal {
            name
            group {
              ...MyGroupFragment
            }
          }
        `),
      },
      {
        location: '/operations/fragments/MyGroupFragment.graphql',
        document: parse(/* GraphQL */ `
          #import "./AnotherGroupFragment.graphql"

          fragment MyGroupFragment on Group {
            ...AnotherGroupFragment
            name
          }
        `),
      },
    ];

    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {
        skipTypename: true,
        dedupeFragments: true,
        exportFragmentSpreadSubTypes: true,
      },
      presetConfig: {
        extension: '.ts',
        baseTypesPath: '../types',
      },
      schema: testSchema,
      schemaAst: buildASTSchema(testSchema),
      documents: operations,
      plugins: [{ typescript: {} }, { 'typescript-operations': {} }, { 'typed-document-node': {} }],
      pluginMap: { typescript: {} as any, 'typescript-operations': {} as any, 'typed-document-node': {} as any },
    });

    expect(getFragmentImportsFromResult(result)).toContain(
      `import { MyGroupFragmentFragmentDoc, MyGroupFragmentFragment } from './fragments/MyGroupFragment.js';`
    );

    expect(getFragmentImportsFromResult(result)).toContain(
      `import { AnotherGroupFragmentFragmentDoc, AnotherGroupFragmentFragment } from './fragments/AnotherGroupFragment.js';`
    );
  });

  it('Should import relevant nested fragments on dedupeFragments', async () => {
    const schema = parse(/* GraphQL */ `
      type Address {
        city: String
      }

      type Author {
        address: Address
      }

      type Book {
        author: Author
      }

      type Query {
        book: Book
      }
    `);

    const operations = [
      {
        location: '/author.graphql',
        document: parse(/* GraphQL */ `
          fragment Address on Address {
            city
          }

          fragment Author on Author {
            address {
              ...Address
            }
          }
        `),
      },
      {
        location: '/book.graphql',
        document: parse(/* GraphQL */ `
          fragment Book on Book {
            author {
              ...Author
            }
          }

          query Book {
            book {
              ...Book
            }
          }
        `),
      },
    ];

    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {
        dedupeFragments: true,
      },
      presetConfig: {
        extension: '.ts',
        baseTypesPath: './types',
      },
      schema,
      schemaAst: buildASTSchema(schema),
      documents: operations,
      plugins: [{ typescript: {} }, { 'typescript-operations': {} }, { 'typed-document-node': {} }],
      pluginMap: { typescript: {} as any, 'typescript-operations': {} as any, 'typed-document-node': {} as any },
    });

    expect(getFragmentImportsFromResult(result, 1)).toContain(
      `import { AuthorFragmentDoc, AuthorFragment, AddressFragmentDoc, AddressFragment } from './author.js';`
    );
  });
});

const getFragmentImportsFromResult = (result: Types.GenerateOptions[], index = 0) =>
  result[index].config.fragmentImports
    .map(importStatement => generateFragmentImportStatement(importStatement, 'both'))
    .join('\n');
