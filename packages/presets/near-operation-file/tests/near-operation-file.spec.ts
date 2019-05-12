import preset from '../src/index';
import { parse } from 'graphql';

describe('near-operation-file preset', () => {
  const schemaDocumentNode = parse(/* GraphQL */ `
    type Query {
      f: String
    }
  `);
  const operationAst = parse(/* GraphQL */ `
    query {
      f
    }
  `);
  const testDocuments = [
    {
      filePath: '/some/deep/path/src/graphql/me-query.graphql',
      content: operationAst,
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
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        baseTypesPath: 'types.ts',
      },
      schema: schemaDocumentNode,
      documents: testDocuments,
      plugins: [],
      pluginMap: {},
    });

    expect(result.map(a => a.filename)).toEqual([
      '/some/deep/path/src/graphql/me-query.generated.ts',
      '/some/deep/path/src/graphql/me.query.generated.ts',
      '/some/deep/path/src/graphql/something-query.generated.ts',
      '/some/deep/path/src/graphql/nested/somethingElse.generated.ts',
      '/some/deep/path/src/graphql/nested/from-js.generated.ts',
      '/some/deep/path/src/graphql/component.generated.ts',
    ]);
  });

  it('Should allow to customize output extension', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path/',
        baseTypesPath: 'types.ts',
        extension: '.flow.js',
      },
      schema: schemaDocumentNode,
      documents: testDocuments,
      plugins: [],
      pluginMap: {},
    });

    expect(result.map(a => a.filename)).toEqual([
      '/some/deep/path/src/graphql/me-query.flow.js',
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
        cwd: '/some/deep/path/',
        baseTypesPath: 'types.ts',
      },
      schema: schemaDocumentNode,
      documents: testDocuments,
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.plugins[0])).toEqual([
      { add: `import * as Types from '../types';\n` },
      { add: `import * as Types from '../types';\n` },
      { add: `import * as Types from '../types';\n` },
      { add: `import * as Types from '../../types';\n` },
      { add: `import * as Types from '../../types';\n` },
      { add: `import * as Types from '../types';\n` },
    ]);
  });

  it('Should add "add" plugin to plugins map if its not there', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path/',
        baseTypesPath: 'types.ts',
      },
      schema: schemaDocumentNode,
      documents: testDocuments,
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.pluginMap['add'])[0]).toBeDefined();
  });

  it('Should add "namespacedImportName" to config', async () => {
    const result = await preset.buildGeneratesSection({
      baseOutputDir: './src/',
      config: {},
      presetConfig: {
        cwd: '/some/deep/path/',
        baseTypesPath: 'types.ts',
      },
      schema: schemaDocumentNode,
      documents: testDocuments,
      plugins: [{ typescript: {} }],
      pluginMap: { typescript: {} as any },
    });

    expect(result.map(o => o.config.namespacedImportName)[0]).toBe('Types');
  });
});
