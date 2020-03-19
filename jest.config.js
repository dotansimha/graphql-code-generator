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
  moduleDirectories: ['node_modules', '<rootDir>/packages'],
  modulePathIgnorePatterns: ['<rootDir>/packages/.*/dist/'],
};
