import '@graphql-codegen/testing';
import { normalize } from 'path';
import { executeCodegen } from '@graphql-codegen/cli';

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
  // In this test, we make sure executeCodegen passes on a list of Sources as an extension
  // This is very important
  test('should generate a base output and 4 for modules', async () => {
    const { result } = await executeCodegen(options);

    expect(result.length).toBe(5);
    expect(normalize(result[0].filename)).toMatch(normalize(`/modules/global-types.ts`));
    expect(normalize(result[1].filename)).toMatch(normalize(`/modules/blog/module-types.ts`));
    expect(normalize(result[2].filename)).toMatch(normalize(`/modules/common/module-types.ts`));
    expect(normalize(result[3].filename)).toMatch(normalize(`/modules/dotanions/module-types.ts`));
    expect(normalize(result[4].filename)).toMatch(normalize(`/modules/users/module-types.ts`));
  });

  test('should not duplicate type even if type and extend type are in the same module', async () => {
    const { result } = await executeCodegen(options);

    const userResolversStr = `export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User']>;`;
    const nbOfTimeUserResolverFound = result[4].content.split(userResolversStr).length - 1;

    expect(nbOfTimeUserResolverFound).toBe(1);
  });

  test('should allow to override importBaseTypesFrom correctly', async () => {
    const { result } = await executeCodegen({
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

    expect(result.length).toBe(5);
    expect(result[1].content).toMatch(importStatement);
    expect(result[2].content).toMatch(importStatement);
    expect(result[3].content).toMatch(importStatement);
    expect(result[4].content).toMatch(importStatement);
  });

  test('should import with respect of useTypeImports config correctly', async () => {
    const { result } = await executeCodegen({
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

    expect(result.length).toBe(5);
    expect(result[1].content).toMatch(importStatement);
    expect(result[2].content).toMatch(importStatement);
    expect(result[3].content).toMatch(importStatement);
    expect(result[4].content).toMatch(importStatement);
  });

  test('should allow to disable graphql-modules', async () => {
    const { result } = await executeCodegen({
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

    for (const record of result) {
      expect(record).not.toContain(`graphql-modules`);
      expect(record).not.toContain(`gm.`);
    }
  });

  test('each module-types should include a relative import to glob-types module', async () => {
    const { result } = await executeCodegen(options);
    const importStatement = `import * as Types from "../global-types";`;

    expect(result.length).toBe(5);
    expect(result[1].content).toMatch(importStatement);
    expect(result[2].content).toMatch(importStatement);
    expect(result[3].content).toMatch(importStatement);
    expect(result[4].content).toMatch(importStatement);
  });

  test('each module-types should export Resolvers', async () => {
    const { result } = await executeCodegen(options);
    const exportStatemment = `export interface Resolvers `;

    expect(result.length).toBe(5);
    expect(result[1].content).toMatch(exportStatemment);
    expect(result[2].content).toMatch(exportStatemment);
    expect(result[3].content).toMatch(exportStatemment);
    expect(result[4].content).toMatch(exportStatemment);
  });

  test('dotanions module should export DefinedFields, Schema Types with Picks and resolvers', async () => {
    const { result } = await executeCodegen(options);

    expect(result.length).toBe(5);
    expect(result[3].content).toMatchSnapshot();
  });

  test('should NOT produce required root-level resolvers in Resolvers interface by default', async () => {
    const { result } = await executeCodegen(options);

    const usersModuleOutput = result.find(o => o.filename.includes('users'))!;

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

    const { result } = await executeCodegen(optionsCopy);

    const usersModuleOutput = result.find(o => o.filename.includes('users'))!;

    expect(usersModuleOutput).toBeDefined();

    // Only Query related properties should be required
    expect(usersModuleOutput.content).toBeSimilarStringTo(`
      export type UserResolvers = Pick<Types.UserResolvers, DefinedFields['User']>;
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
    const { result } = await executeCodegen(emitLegacyCommonJSImports);
    const esmImportStatement = `import * as Types from "../global-types.js";`;

    expect(result.length).toBe(5);
    expect(result[1].content).toMatch(esmImportStatement);
    expect(result[2].content).toMatch(esmImportStatement);
    expect(result[3].content).toMatch(esmImportStatement);
    expect(result[4].content).toMatch(esmImportStatement);
  });

  test('import paths should use importExtension when set to .mjs', async () => {
    const withImportExtension = {
      ...options,
      importExtension: '.mjs' as const,
    };
    const { result } = await executeCodegen(withImportExtension);
    const importStatement = `import * as Types from "../global-types.mjs";`;

    expect(result.length).toBe(5);
    expect(result[1].content).toMatch(importStatement);
    expect(result[2].content).toMatch(importStatement);
    expect(result[3].content).toMatch(importStatement);
    expect(result[4].content).toMatch(importStatement);
  });

  test('import paths should use importExtension when set to empty string', async () => {
    const withImportExtension = {
      ...options,
      importExtension: '' as const,
    };
    const { result } = await executeCodegen(withImportExtension);
    const importStatement = `import * as Types from "../global-types";`;

    expect(result.length).toBe(5);
    expect(result[1].content).toMatch(importStatement);
    expect(result[2].content).toMatch(importStatement);
    expect(result[3].content).toMatch(importStatement);
    expect(result[4].content).toMatch(importStatement);
  });

  test('importExtension should override emitLegacyCommonJSImports', async () => {
    const withBothOptions = {
      ...options,
      importExtension: '.mjs' as const,
      emitLegacyCommonJSImports: false,
    };
    const { result } = await executeCodegen(withBothOptions);
    const importStatement = `import * as Types from "../global-types.mjs";`;

    expect(result.length).toBe(5);
    // Should use .mjs from importExtension, not .js from emitLegacyCommonJSImports
    expect(result[1].content).toMatch(importStatement);
    expect(result[2].content).toMatch(importStatement);
    expect(result[3].content).toMatch(importStatement);
    expect(result[4].content).toMatch(importStatement);
  });

  test('importExtension set to empty string should override emitLegacyCommonJSImports: false', async () => {
    const withBothOptions = {
      ...options,
      importExtension: '' as const,
      emitLegacyCommonJSImports: false,
    };
    const { result } = await executeCodegen(withBothOptions);
    const importStatement = `import * as Types from "../global-types";`;

    expect(result.length).toBe(5);
    // Should use empty string from importExtension, not .js from emitLegacyCommonJSImports
    expect(result[1].content).toMatch(importStatement);
    expect(result[2].content).toMatch(importStatement);
    expect(result[3].content).toMatch(importStatement);
    expect(result[4].content).toMatch(importStatement);
  });
});
