const CI = !!process.env.CI;
const USE_PROJECTS = false || !CI;

module.exports =
  USE_PROJECTS
    ? require('./jest.project')({ dirname: __dirname, projectMode: USE_PROJECTS })
    : {
        rootDir: __dirname,
        projects: ['<rootDir>/packages/**/*/jest.config.js'],
      };
