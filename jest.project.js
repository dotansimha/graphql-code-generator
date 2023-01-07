const { resolve } = require('node:path');
// eslint-disable-next-line import/no-extraneous-dependencies -- false positive
const { pathsToModuleNameMapper } = require('ts-jest');

const ROOT_DIR = __dirname;
const TSCONFIG = resolve(ROOT_DIR, 'tsconfig.json');
const tsconfig = require(TSCONFIG);
const CI = Boolean(process.env.CI);

module.exports = ({ dirname, projectMode = true }) => {
  const pkg = require(resolve(dirname, 'package.json'));

  return {
    ...(CI || !projectMode ? {} : { displayName: pkg.name.replace('@graphql-codegen/', '') }),
    transform: { '^.+\\.tsx?$': 'babel-jest' },
    testEnvironment: 'node',
    rootDir: dirname,
    restoreMocks: true,
    reporters: ['default'],
    modulePathIgnorePatterns: ['dist', '.bob'],
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: `${ROOT_DIR}/` }),
    cacheDirectory: resolve(ROOT_DIR, `${CI ? '' : 'node_modules/'}.cache/jest`),
    setupFiles: [`${ROOT_DIR}/dev-test/setup.js`],
    collectCoverage: false,
    testTimeout: 20_000,
    resolver: 'bob-the-bundler/jest-resolver.js',
    snapshotFormat: {
      escapeString: false,
    },
  };
};
