const PROJECTS = false;
const CI = !!process.env.CI;

module.exports =
  !PROJECTS || CI
    ? require('./jest.project')({ dirname: __dirname, projectMode: PROJECTS })
    : {
        rootDir: __dirname,
        projects: ['<rootDir>/packages/**/*/jest.config.js'],
        resolver: 'bob-the-bundler/jest-resolver.js',
      };
