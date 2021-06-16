import { useMonorepo } from '@graphql-codegen/testing';
import { executeCodegen } from '@graphql-codegen/cli';
import { normalize } from 'path';

const monorepo = useMonorepo({
  dirname: __dirname,
});

const options = {
  generates: {
    './tests/test-files/modules': {
      schema: './tests/test-files/modules/*/types/*.graphql',
      plugins: ['typescript', 'typescript-resolvers'],
      preset: 'graphql-modules',
      presetConfig: {
        baseTypesPath: 'global-types.ts',
        filename: 'module-types.ts',
        encapsulateModuleTypes: 'none',
      },
    },
  },
};

describe('Integration', () => {
  monorepo.correctCWD();

  beforeEach(() => {
    jest.useFakeTimers('legacy');
  });

  // In this test, we make sure executeCodegen passes on a list of Sources as an extension
  // This is very important
  test('should generate a base output and 4 for modules', async () => {
    try {
      const output = await executeCodegen(options);

      expect(output.length).toBe(5);
      expect(normalize(output[0].filename)).toMatch(normalize(`/modules/global-types.ts`));
      expect(normalize(output[1].filename)).toMatch(normalize(`/modules/blog/module-types.ts`));
      expect(normalize(output[2].filename)).toMatch(normalize(`/modules/common/module-types.ts`));
      expect(normalize(output[3].filename)).toMatch(normalize(`/modules/dotanions/module-types.ts`));
      expect(normalize(output[4].filename)).toMatch(normalize(`/modules/users/module-types.ts`));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      throw e;
    }
  });

  test.only('should allow to override importBaseTypesFrom correctly', async () => {
    const output = await executeCodegen({
      generates: {
        './tests/test-files/modules': {
          schema: './tests/test-files/modules/*/types/*.graphql',
          plugins: ['typescript', 'typescript-resolvers'],
          preset: 'graphql-modules',
          presetConfig: {
            importBaseTypesFrom: '@types',
            baseTypesPath: 'global-types.ts',
            filename: 'module-types.ts',
            encapsulateModuleTypes: 'none',
          },
        },
      },
    });
    const importStatement = `import * as Types from "@types";`;

    expect(output.length).toBe(5);
    expect(output[1].content).toMatch(importStatement);
    expect(output[2].content).toMatch(importStatement);
    expect(output[3].content).toMatch(importStatement);
    expect(output[4].content).toMatch(importStatement);
  });

  test('each module-types should include a relative import to glob-types module', async () => {
    const output = await executeCodegen(options);
    const importStatement = `import * as Types from "../global-types";`;

    expect(output.length).toBe(5);
    expect(output[1].content).toMatch(importStatement);
    expect(output[2].content).toMatch(importStatement);
    expect(output[3].content).toMatch(importStatement);
    expect(output[4].content).toMatch(importStatement);
  });

  test('each module-types should export Resolvers', async () => {
    const output = await executeCodegen(options);
    const exportStatemment = `export interface Resolvers `;

    expect(output.length).toBe(5);
    expect(output[1].content).toMatch(exportStatemment);
    expect(output[2].content).toMatch(exportStatemment);
    expect(output[3].content).toMatch(exportStatemment);
    expect(output[4].content).toMatch(exportStatemment);
  });

  test('dotanions module should export DefinedFields, Schema Types with Picks and resolvers', async () => {
    const output = await executeCodegen(options);

    expect(output.length).toBe(5);
    expect(output[3].content).toMatchSnapshot();
  });
});
