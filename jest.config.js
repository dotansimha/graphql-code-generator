module.exports = {
  collectCoverageFrom: [
    'packages/**/src/**/*.ts',
    '!packages/utils/**/*',
    '!**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: __dirname,
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        addFileAttribute: 'true',
      },
    ],
  ],
  roots: ['<rootDir>/packages'],
  modulePathIgnorePatterns: ['<rootDir>/packages/.*/dist/'],
  moduleNameMapper: {
    '^@graphql-codegen/cli$': '<rootDir>/packages/graphql-codegen-cli/src/index.ts',
    '^@graphql-codegen/core$': '<rootDir>/packages/graphql-codegen-core/src/index.ts',

    '^@graphql-codegen/(typescript|flow|java)$': '<rootDir>/packages/plugins/$1/$1/src/index.ts',
    '^@graphql-codegen/(typescript|flow|java)-([\\w-]+)$': '<rootDir>/packages/plugins/$1/$2/src/index.ts',
    '^@graphql-codegen/kotlin$': '<rootDir>/packages/plugins/java/kotlin/src/index.ts',

    '^@graphql-codegen/add$': '<rootDir>/packages/plugins/other/add/src/index.ts',
    '^@graphql-codegen/fragment-matcher$': '<rootDir>/packages/plugins/other/fragment-matcher/src/index.ts',
    '^@graphql-codegen/introspection$': '<rootDir>/packages/plugins/other/introspection/src/index.ts',
    '^@graphql-codegen/schema-ast$': '<rootDir>/packages/plugins/other/schema-ast/src/index.ts',
    '^@graphql-codegen/time$': '<rootDir>/packages/plugins/other/time/src/index.ts',
    '^@graphql-codegen/visitor-plugin-common$': '<rootDir>/packages/plugins/other/visitor-plugin-common/src/index.ts',

    '^@graphql-codegen/import-types-preset$': '<rootDir>/packages/presets/import-types/src/index.ts',
    '^@graphql-codegen/near-operation-file-preset$': '<rootDir>/packages/presets/near-operation-file/src/index.ts',

    '^@graphql-codegen/config-markdown-generator$': '<rootDir>/packages/utils/config-md-generator/src/index.ts',
    '^@graphql-codegen/testing$': '<rootDir>/packages/utils/graphql-codegen-testing/src/index.ts',
    '^@graphql-codegen/plugin-helpers$': '<rootDir>/packages/utils/plugins-helpers/src/index.ts'
  },
};
