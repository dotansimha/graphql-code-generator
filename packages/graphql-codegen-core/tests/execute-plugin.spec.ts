import { extname } from 'path';
import { parse } from 'graphql';
import { executePlugin } from '../src/execute-plugin.js';

describe('executePlugin', () => {
  it('only rejects a disallowed output file when validate is the only plugin', async () => {
    await expect(
      executePlugin(
        {
          name: 'custom',
          config: {},
          parentConfig: {},
          schema: parse(/* GraphQL */ `
            type Query {
              foo: String
            }
          `),
          documents: [],
          outputFilename: 'output.ts',
          allPlugins: [{ custom: {} }],
          pluginContext: {},
        },
        {
          plugin: () => '',
          validate: (_schema, _documents, _config, { outputFile, allPlugins }) => {
            if (allPlugins.length === 1 && extname(outputFile) !== '.graphql') {
              throw new Error('output file must be .graphql');
            }
          },
        },
      ),
    ).rejects.toThrow('output file must be .graphql');
    await expect(
      executePlugin(
        {
          name: 'custom',
          config: {},
          parentConfig: {},
          schema: parse(/* GraphQL */ `
            type Query {
              foo: String
            }
          `),
          documents: [],
          outputFilename: 'output.ts',
          allPlugins: [{ custom: {} }, { other: {} }],
          pluginContext: {},
        },
        {
          plugin: () => '',
          validate: (_schema, _documents, _config, { outputFile, allPlugins }) => {
            if (allPlugins.length === 1 && extname(outputFile) !== '.graphql') {
              throw new Error('output file must be .graphql');
            }
          },
        },
      ),
    ).resolves.toBe('');
  });

  it('rejects when validate rejects the output file', async () => {
    await expect(
      executePlugin(
        {
          name: 'custom',
          config: {},
          parentConfig: {},
          schema: parse(/* GraphQL */ `
            type Query {
              foo: String
            }
          `),
          documents: [],
          outputFilename: 'output.js',
          allPlugins: [],
          pluginContext: {},
        },
        {
          plugin: () => '',
          validate: (_schema, _documents, _config, info) => {
            if (!info.outputFile.endsWith('.ts')) {
              throw new Error('output file must be .ts');
            }
          },
        },
      ),
    ).rejects.toThrow('output file must be .ts');
  });

  it('reports a non-Error thrown by validate', async () => {
    await expect(
      executePlugin(
        {
          name: 'custom',
          config: {},
          parentConfig: {},
          schema: parse(/* GraphQL */ `
            type Query {
              foo: String
            }
          `),
          documents: [],
          outputFilename: 'output.ts',
          allPlugins: [],
          pluginContext: {},
        },
        {
          plugin: () => '',
          validate: () => {
            throw 'bad extension';
          },
        },
      ),
    ).rejects.toThrow('bad extension');
  });
});
