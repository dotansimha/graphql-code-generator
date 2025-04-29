import { useMonorepo } from '@graphql-codegen/testing';
import { generate } from '../src/generate-and-save.js';
import { createContext } from '../src/config.js';
import * as fs from '../src/utils/file-system.js';

const monorepo = useMonorepo({ dirname: __dirname });

describe('generate-and-save - GraphQL Config', () => {
  monorepo.correctCWD();

  const originalConsole = { ...console };
  const originalNodeEnv = process.env.NODE_ENV;

  let consoleErrorMock: jest.Mock;

  beforeEach(() => {
    // Mock common console functions to avoid noise in the terminal
    global.console.log = jest.fn();
    global.console.warn = jest.fn();
    global.console.error = jest.fn();

    // By default, the NODE_ENV is set to 'test', and this is used to silent console errors.
    // For these tests below, we want to see what's being logged out to console errors.
    process.env.NODE_ENV = 'not_test_so_error';

    consoleErrorMock = jest.mocked(global.console.error);
  });

  afterEach(() => {
    jest.resetAllMocks();
    global.console = originalConsole;
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('No documents found - GraphQL Config - should throw error by default', async () => {
    expect.assertions(1);
    try {
      const config = await createContext({
        config: './tests/test-files/graphql.config.no-doc.js',
        project: undefined,
        errorsOnly: true,
        overwrite: true,
        profile: true,
        require: [],
        silent: false,
        watch: false,
      });

      await generate(config, false);
    } catch {
      expect(consoleErrorMock.mock.calls[0][0]).toBeSimilarStringTo(`
        [FAILED]
        [FAILED]       Unable to find any GraphQL type definitions for the following pointers:
        [FAILED]
        [FAILED]         - ../test-documents/empty.graphql
      `);
    }
  });

  test('No documents found - GraphQL Config - should not fail if ignoreNoDocuments=true', async () => {
    jest.spyOn(fs, 'writeFile').mockImplementation();
    const config = await createContext({
      config: './tests/test-files/graphql.config.no-doc-ignored.js',
      project: undefined,
      errorsOnly: true,
      overwrite: true,
      profile: true,
      require: [],
      silent: false,
      watch: false,
    });

    await generate(config, false);

    expect(consoleErrorMock).not.toHaveBeenCalled();
  });
});
