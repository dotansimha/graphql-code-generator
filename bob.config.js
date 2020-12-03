module.exports = {
  ignore: ['@graphql-codegen/website', '@graphql-codegen/live-demo', '@graphql-codegen/config-schema'],
  base: 'origin/master',
  track: [
    'bob.config.js',
    'package.json',
    'yarn.lock',
    'tsconfig.json',
    '<project>/package.json',
    '<project>/tsconfig.json',
    '<project>/src/**',
  ],
  commands: {
    test: {
      track: [
        'jest.config.js',
        'jest.project.js',
        '<project>/jest.config.js',
        '<project>/tests/**',
      ],
      run(affected) {
        return [`yarn`, ['test', '--passWithNoTests', ...affected.paths]];
      },
    },
    build: {
      run() {
        return [`yarn`, ['build']];
      },
    },
  },
};
