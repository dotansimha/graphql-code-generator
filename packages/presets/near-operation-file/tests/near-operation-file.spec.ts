import { Types } from '@graphql-codegen/plugin-helpers';
import { generateFragmentImportStatement } from '@graphql-codegen/visitor-plugin-common';
import { buildASTSchema, buildSchema, parse, printSchema } from 'graphql';
import { preset } from '../src/index';

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
          schema: parse(printSchema(testSchema)),
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
        `import { PageFragmentDoc, PageFragment, BookFragmentDoc, BookFragment } from './fragments.generated';`
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
        `import { BookFragmentDoc, BookFragment, PageFragmentDoc, PageFragment } from './fragments.generated';`
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
              content: `import * as Types from '../types';\n`,
            },
          },
          {
            'typescript-react-apollo': {},
          },
        ])
      );

      expect(getFragmentImportsFromResult(result)).toContain(
        `import { UserFieldsFragmentDoc, UserFieldsFragment } from './user-fragment.generated';`
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
              content: `import * as Types from '../types';\n`,
            },
          },
          {
            'typescript-react-apollo': {},
          },
        ])
      );

      expect(getFragmentImportsFromResult(result)).toContain(
        `import { UserFieldsFragmentFragmentDoc, UserFieldsFragmentFragment } from './user-fragment.generated';`
      );
    });
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
            content: `import * as Types from '../types';\n`,
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
            content: `import * as Types from '../types';\n`,
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
      expect.arrayContaining([{ add: { content: `import * as Types from '../types';\n` } }])
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
            query($id: String) {
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
            content: `import * as Types from './src/types';\n`,
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
            content: `import * as Types from '../../../types';\n`,
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
            content: `import * as Types from './types';\n`,
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
            content: `import * as Types from '../types';\n`,
          },
        },
        {
          'typescript-react-apollo': {},
        },
      ])
    );

    expect(getFragmentImportsFromResult(result)).toContain(
      `import { UserFieldsFragmentDoc, UserFieldsFragment } from './user-fragment.generated';`
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
      `import { UserFieldsFragmentDoc, UserFieldsFragment } from '../../../user-fragment.generated';`
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
      `import { UserFieldsFragmentDoc, UserFieldsFragment } from './nested/down/here/user-fragment.generated';`
    );
  });
});

const getFragmentImportsFromResult = (result: Types.GenerateOptions[]) =>
  result[0].config.fragmentImports
    .map(importStatement => generateFragmentImportStatement(importStatement, 'both'))
    .join('\n');
