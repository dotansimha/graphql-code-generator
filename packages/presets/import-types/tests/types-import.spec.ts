import preset from '../src/index';
import { parse } from 'graphql';

describe('import-types preset', () => {
  const schemaDocumentNode = parse(/* GraphQL */ `
    type Query {
      user: User!
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
      filePath: '/some/deep/path/src/graphql/me-query.graphql',
      content: operationAst,
    },
    {
      filePath: '/some/deep/path/src/graphql/user-fragment.graphql',
      content: fragmentAst,
    },
    {
      filePath: '/some/deep/path/src/graphql/me.query.graphql',
      content: operationAst,
    },
    {
      filePath: '/some/deep/path/src/graphql/something-query.graphql',
      content: operationAst,
    },
    {
      filePath: '/some/deep/path/src/graphql/nested/somethingElse.graphql',
      content: operationAst,
    },
    {
      filePath: '/some/deep/path/src/graphql/nested/from-js.js',
      content: operationAst,
    },
    {
      filePath: '/some/deep/path/src/graphql/component.ts',
      content: operationAst,
    },
  ];

  it('Should build the correct operation files paths', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/operation.ts',
      config: {},
      presetConfig: {
        typesPath: './types',
      },
      schema: schemaDocumentNode,
      documents: testDocuments,
      plugins: [],
      pluginMap: {},
    });

    expect(result.map(a => a.filename)).toEqual(['./src/operation.ts']);
  });

  it('Should prepend the "add" plugin with the correct import', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/operation.ts',
      config: {},
      presetConfig: {
        typesPath: './types',
      },
      schema: schemaDocumentNode,
      documents: testDocuments.slice(0, 2),
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.plugins)[0]).toEqual(expect.arrayContaining([{ add: `import * as Types from './types';\n` }]));
  });

  it('Should prepend the "add" plugin with the correct import, when only using fragment spread', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/operation.ts',
      config: {},
      presetConfig: {
        typesPath: './types',
      },
      schema: schemaDocumentNode,
      documents: [{ filePath: '/some/deep/path/src/graphql/me-query.graphql', content: minimalOperationAst }, testDocuments[1]],
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.plugins)[0]).toEqual(expect.arrayContaining([{ add: `import * as Types from './types';\n` }]));
  });

  it('Should NOT prepend the "add" plugin with Types import when selection set does not include direct fields', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/operation.ts',
      config: {},
      presetConfig: {
        typesPath: './types',
      },
      schema: schemaDocumentNode,
      documents: [
        {
          filePath: './test.graphql',
          content: parse(/* GraphQL */ `
            query {
              user {
                ...UserFields
              }
            }
          `),
        },
        testDocuments[1],
      ],
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.plugins)[0]).not.toEqual(expect.arrayContaining([{ add: `import * as Types from '../types';\n` }]));
  });

  it('Should add "add" plugin to plugins map if its not there', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/operation.ts',
      config: {},
      presetConfig: {
        typesPath: './types',
      },
      schema: schemaDocumentNode,
      documents: testDocuments.slice(0, 2),
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.pluginMap['add'])[0]).toBeDefined();
  });

  it('Should add "namespacedImportName" to config', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/operation.ts',
      config: {},
      presetConfig: {
        typesPath: './types',
      },
      schema: schemaDocumentNode,
      documents: testDocuments.slice(0, 2),
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.config.namespacedImportName)[0]).toBe('Types');
  });
});
