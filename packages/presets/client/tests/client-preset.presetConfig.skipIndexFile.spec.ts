import path from 'path';
import { executeCodegen } from '@graphql-codegen/cli';
import { preset } from '../src/index.js';

describe('client-preset - presetConfig.skipIndexFile', () => {
  const schema = [
    /* GraphQL */ `
      type Query {
        a: String
        b: String
        c: String
      }
    `,
  ];

  it('generates index.ts by default', async () => {
    const { result } = await executeCodegen({
      schema,
      documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
      generates: {
        'out1/': {
          preset,
        },
      },
    });

    expect(result).toHaveLength(4);
    const indexFile = result.find(file => file.filename === 'out1/index.ts');
    expect(indexFile).toBeDefined();
    expect(indexFile.content).toEqual(`export * from "./fragment-masking";
export * from "./gql";`);
  });

  it('does not generate index.ts when `skipIndexFile: true`', async () => {
    const { result } = await executeCodegen({
      schema,
      documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
      generates: {
        'out1/': {
          preset,
          presetConfig: {
            skipIndexFile: true,
          },
        },
      },
    });

    expect(result).toHaveLength(3);
    const indexFile = result.find(file => file.filename === 'out1/index.ts');
    expect(indexFile).toBeUndefined();
  });

  it('generates index.ts when `skipIndexFile: false`', async () => {
    const { result } = await executeCodegen({
      schema,
      documents: path.join(__dirname, 'fixtures/simple-uppercase-operation-name.ts'),
      generates: {
        'out1/': {
          preset,
          presetConfig: {
            skipIndexFile: false,
          },
        },
      },
    });

    expect(result).toHaveLength(4);
    const indexFile = result.find(file => file.filename === 'out1/index.ts');
    expect(indexFile).toBeDefined();
    expect(indexFile.content).toEqual(`export * from "./fragment-masking";
export * from "./gql";`);
  });
});
