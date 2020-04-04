module.exports = {
  scope: '@graphql-codegen',
  ignore: ['@graphql-codegen/website', '@graphql-codegen/live-demo'],
  track: [
    'bob.config.js',
    'package.json',
    'tsconfig.json',
    '<project>/package.json',
    '<project>/tsconfig.json',
    '<project>/src/**',
  ],
  base: `origin/master`,
  commands: {
    test: {
      track: ['jest.config.js', 'jest-project.js', '<project>/jest.config.js', '<project>/tests/**'],
      run(affected) {
        return [`yarn`, ['test', ...affected.paths]];
      },
    },
    lint: {
      track: ['.eslintrc.json', '<project>/tests/**'],
      run(affected) {
        return [`yarn`, ['eslint', '--ext', '.ts', ...affected.paths.map(path => `${path}/**/*.ts`)]];
      },
    },
    build: {
      run() {
        return [`yarn`, ['build']];
      },
    },
    examples() {
      return [`yarn`, ['generate:examples']];
    },
  },
};
