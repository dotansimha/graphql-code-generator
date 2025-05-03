import { normalize } from 'path';
import { executeCodegen } from '@graphql-codegen/cli';
import { useMonorepo } from '@graphql-codegen/testing';

const monorepo = useMonorepo({
  dirname: __dirname,
});

const options = {
  generates: {
    './tests/test-files/modules': {
      schema: './tests/test-files/modules/*/types/*.graphql',
      plugins: ['typescript', 'typescript-resolvers'],
      preset: 'graphql-modules' as const,
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
    jest.useFakeTimers({
      legacyFakeTimers: true,
    });
  });

  // In this test, we make sure executeCodegen passes on a list of Sources as an extension
  // This is very important
  test('should generate a base output and 4 for modules', async () => {
    const output = await executeCodegen(options);

    expect(output.length).toBe(5);
    expect(normalize(output[0].filename)).toMatch(normalize(`/modules/global-types.ts`));
    expect(normalize(output[1].filename)).toMatch(normalize(`/modules/blog/module-types.ts`));
    expect(normalize(output[2].filename)).toMatch(normalize(`/modules/common/module-types.ts`));
    expect(normalize(output[3].filename)).toMatch(normalize(`/modules/dotanions/module-types.ts`));
    expect(normalize(output[4].filename)).toMatch(normalize(`/modules/users/module-types.ts`));
  });

  test('should not duplicate type even if type and extend type are in the same module', async () => {
    const output = await executeCodegen(options);

    const userResolversStr = `export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;`;
    const nbOfTimeUserResolverFound = output[4].content.split(userResolversStr).length - 1;

    expect(nbOfTimeUserResolverFound).toBe(1);
  });

  test('should allow to override importBaseTypesFrom correctly', async () => {
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

  test('should import with respect of useTypeImports config correctly', async () => {
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
      config: {
        useTypeImports: true,
      },
    });

    const importStatement = `import type * as Types from "@types";`;

    expect(output.length).toBe(5);
    expect(output[1].content).toMatch(importStatement);
    expect(output[2].content).toMatch(importStatement);
    expect(output[3].content).toMatch(importStatement);
    expect(output[4].content).toMatch(importStatement);
  });

  test('should allow to disable graphql-modules', async () => {
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
            useGraphQLModules: false,
          },
        },
      },
    });

    for (const record of output) {
      expect(record).not.toContain(`graphql-modules`);
      expect(record).not.toContain(`gm.`);
    }
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

  test('should NOT produce required root-level resolvers in Resolvers interface by default', async () => {
    const output = await executeCodegen(options);

    const usersModuleOutput = output.find(o => o.filename.includes('users'))!;

    expect(usersModuleOutput).toBeDefined();
    expect(usersModuleOutput.content).toContain(
      `export type QueryResolvers = Pick<Types.QueryResolvers, DefinedFields['Query']>;`
    );
    expect(usersModuleOutput.content).toContain('Query?: QueryResolvers;');
  });

  test('should produce required root-level resolvers in Resolvers interface when requireRootResolvers flag is enabled', async () => {
    const optionsCopy = Object.assign({} as any, options);

    optionsCopy.generates['./tests/test-files/modules'].presetConfig = {
      ...optionsCopy.generates['./tests/test-files/modules'].presetConfig,
      requireRootResolvers: true,
      useGraphQLModules: false,
    };

    const output = await executeCodegen(optionsCopy);

    const usersModuleOutput = output.find(o => o.filename.includes('users'))!;

    expect(usersModuleOutput).toBeDefined();

    // Only Query related properties should be required
    expect(usersModuleOutput.content).toBeSimilarStringTo(`
      export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User'] | '__isTypeOf'>;
      export type QueryResolvers = Required<Pick<Types.QueryResolvers, DefinedFields['Query']>>;
    `);
    expect(usersModuleOutput.content).toBeSimilarStringTo(`
      export interface Resolvers {
        User?: UserResolvers;
        Query: QueryResolvers;
      };
    `);
  });

  test('import paths for ESM should have correct extension', async () => {
    const emitLegacyCommonJSImports = {
      ...options,
      emitLegacyCommonJSImports: false,
    };
    const output = await executeCodegen(emitLegacyCommonJSImports);
    const esmImportStatement = `import * as Types from "../global-types.js";`;

    expect(output.length).toBe(5);
    expect(output[1].content).toMatch(esmImportStatement);
    expect(output[2].content).toMatch(esmImportStatement);
    expect(output[3].content).toMatch(esmImportStatement);
    expect(output[4].content).toMatch(esmImportStatement);
  });
});
