module.exports = {
  scope: '@graphql-codegen',
  ignore: ['@graphql-codegen/website', '@graphql-codegen/live-demo'],
  track: [
    'bob.config.js',
    'jest.config.js',
    'jest-project.js',
    'package.json',
    'tsconfig.json',
    '<project>/src/**',
    '<project>/jest.config.js',
    '<project>/package.json',
    '<project>/tsconfig.json',
  ],
  against: `origin/master`,
  run: {
    test(affected) {
      return [`yarn`, ['test', ...affected.paths]];
    },
    lint(affected) {
      return [`yarn`, ['eslint', '--ext', '.ts', ...affected.paths.map(path => `${path}/**/*.ts`)]];
    },
    build() {
      return [`yarn`, ['build']];
    },
    examples() {
      return [`yarn`, ['generate:examples']];
    },
  },
};
