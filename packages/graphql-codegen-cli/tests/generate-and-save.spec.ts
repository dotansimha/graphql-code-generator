import { dirname, join } from 'path';
import { Types } from '@graphql-codegen/plugin-helpers';
import { useMonorepo } from '@graphql-codegen/testing';
import makeDir from 'make-dir';
import { createContext } from '../src/config.js';
import { generate } from '../src/generate-and-save.js';
import * as fs from '../src/utils/file-system.js';

const SIMPLE_TEST_SCHEMA = `type MyType { f: String } type Query { f: String }`;

const inputFile = join(__dirname, '../temp/input-graphql.tsx');
const outputFile = join(__dirname, '../temp/output-graphql.tsx');

const monorepo = useMonorepo({ dirname: __dirname });

describe('generate-and-save', () => {
  monorepo.correctCWD();

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('allow to specify overwrite for specific output (should write file)', async () => {
    const filename = 'overwrite.ts';
    const writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation();

    const output = await generate(
      {
        schema: SIMPLE_TEST_SCHEMA,
        overwrite: false,
        generates: {
          [filename]: {
            overwrite: true,
            schema: `
            type OtherType { a: String }
          `,
            plugins: ['typescript'],
          },
        },
      },
      true
    );

    expect(output.length).toBe(1);
    // makes sure it writes a new file
    expect(writeSpy).toHaveBeenCalled();
  });

  test('allow to specify overwrite for specific output (should not write file)', async () => {
    const filename = 'overwrite.ts';
    const writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation();
    // forces file to exist
    const fileReadSpy = jest.spyOn(fs, 'readFile');
    fileReadSpy.mockImplementation(async () => '');

    const output = await generate(
      {
        schema: SIMPLE_TEST_SCHEMA,
        overwrite: true,
        generates: {
          [filename]: {
            overwrite: false,
            schema: `
            type OtherType { a: String }
          `,
            plugins: ['typescript'],
          },
        },
      },
      true
    );

    expect(output.length).toBe(1);
    // makes sure it checks if file is there
    expect(fileReadSpy).toHaveBeenCalledWith(filename);
    // makes sure it doesn't write a new file
    expect(writeSpy).not.toHaveBeenCalled();
  });

  test('should use global overwrite option and write a file', async () => {
    const filename = 'overwrite.ts';
    const writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation();

    const output = await generate(
      {
        schema: SIMPLE_TEST_SCHEMA,
        overwrite: true,
        generates: {
          [filename]: {
            schema: `
            type OtherType { a: String }
          `,
            plugins: ['typescript'],
          },
        },
      },
      true
    );

    expect(output.length).toBe(1);
    // makes sure it writes a new file
    expect(writeSpy).toHaveBeenCalled();
  });

  test('should use global overwrite option and not write a file', async () => {
    const filename = 'overwrite.ts';
    const writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation();
    // forces file to exist
    const fileReadSpy = jest.spyOn(fs, 'readFile');
    fileReadSpy.mockImplementation(async () => '');

    const output = await generate(
      {
        schema: SIMPLE_TEST_SCHEMA,
        overwrite: false,
        generates: {
          [filename]: {
            schema: `
            type OtherType { a: String }
          `,
            plugins: ['typescript'],
          },
        },
      },
      true
    );

    expect(output.length).toBe(1);
    // makes sure it checks if file is there
    expect(fileReadSpy).toHaveBeenCalledWith(filename);
    // makes sure it doesn't write a new file
    expect(writeSpy).not.toHaveBeenCalled();
  });

  test('should overwrite a file by default', async () => {
    const filename = 'overwrite.ts';
    const writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation();
    const readSpy = jest.spyOn(fs, 'readFile').mockImplementation();
    readSpy.mockImplementation(async _f => '');

    const output = await generate(
      {
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          [filename]: {
            schema: /* GraphQL */ `
              type OtherType {
                a: String
              }
            `,
            plugins: ['typescript'],
          },
        },
      },
      true
    );

    expect(output.length).toBe(1);
    // makes sure it doesn't write a new file
    expect(writeSpy).toHaveBeenCalled();
  });

  test('should override generated files', async () => {
    jest.unmock('fs');
    const fs = await import('fs');

    makeDir.sync(dirname(outputFile));
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
    fs.writeFileSync(
      inputFile,
      `
    import gql from 'graphql-tag';
    const MyQuery = gql\`query MyQuery { f }\`;
  `,
      'utf8'
    );
    const generateOnce: () => Promise<Types.FileOutput[]> = () =>
      generate(
        {
          schema: SIMPLE_TEST_SCHEMA,
          documents: inputFile,
          generates: {
            [outputFile]: {
              plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
            },
          },
        },
        true
      );
    const [firstOutput] = await generateOnce();
    fs.writeFileSync(firstOutput.filename, firstOutput.content);
    await generateOnce();
  });
  test('should extract a document from the gql tag (imported from apollo-server)', async () => {
    const filename = 'overwrite.ts';
    const writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation();

    const output = await generate(
      {
        schema: `./tests/test-files/schema-dir/gatsby-and-custom-parsers/apollo-server.ts`,
        generates: {
          [filename]: {
            plugins: ['typescript'],
          },
        },
      },
      true
    );

    expect(output.length).toBe(1);
    expect(output[0].content).toMatch('Used apollo-server');
    // makes sure it doesn't write a new file
    expect(writeSpy).toHaveBeenCalled();
  });
  test('should allow to alter the content with the beforeOneFileWrite hook', async () => {
    const filename = 'modify.ts';
    const writeSpy = jest.spyOn(fs, 'writeFile').mockImplementation();

    const output = await generate(
      {
        schema: SIMPLE_TEST_SCHEMA,
        generates: {
          [filename]: {
            plugins: ['typescript'],
            hooks: {
              beforeOneFileWrite: [() => 'new content'],
            },
          },
        },
      },
      true
    );

    expect(output.length).toBe(1);
    expect(output[0].content).toMatch('new content');
    // makes sure it doesn't write a new file
    expect(writeSpy).toHaveBeenCalled();
  });

  describe('Errors when loading pointers', () => {
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
      global.console = originalConsole;
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('Schema syntax error - should print native GraphQLError', async () => {
      expect.assertions(4);
      try {
        await generate(
          {
            verbose: true,
            schema: './tests/test-files/schema-dir/error-schema.graphql',
            generates: {
              'src/test.ts': {
                plugins: ['typescript'],
              },
            },
          },
          false
        );
      } catch {
        expect(consoleErrorMock.mock.calls[0][0]).toBeSimilarStringTo(
          '[FAILED] Failed to load schema from ./tests/test-files/schema-dir/error-schema.graphql:'
        );
        expect(consoleErrorMock.mock.calls[0][0]).toBeSimilarStringTo(
          '[FAILED] Syntax Error: Expected Name, found "!".'
        );
        // We can only use partial file path to the error file, because the error contains absolute path on the host machine
        expect(consoleErrorMock.mock.calls[0][0]).toBeSimilarStringTo(
          '/tests/test-files/schema-dir/error-schema.graphql:2:15'
        );
        expect(consoleErrorMock.mock.calls[0][0]).toBeSimilarStringTo(`
          [FAILED] 1 | type Query {
          [FAILED] 2 |   foo: String!!
          [FAILED]   |               ^
          [FAILED] 3 | }
          [FAILED]
          [FAILED] GraphQL Code Generator supports:
          [FAILED]
          [FAILED] - ES Modules and CommonJS exports (export as default or named export "schema")
          [FAILED] - Introspection JSON File
          [FAILED] - URL of GraphQL endpoint
          [FAILED] - Multiple files with type definitions (glob expression)
          [FAILED] - String in config file
          [FAILED]
          [FAILED] Try to use one of above options and run codegen again.
        `);
      }
    });

    test('Document syntax error - should print native GraphQLError', async () => {
      expect.assertions(4);
      try {
        await generate(
          {
            verbose: true,
            schema: './tests/test-files/schema-dir/schema.ts',
            documents: './tests/test-files/error-document.graphql',
            generates: {
              'src/test.ts': {
                plugins: ['typescript'],
              },
            },
          },
          false
        );
      } catch {
        expect(consoleErrorMock.mock.calls[0][0]).toBeSimilarStringTo(
          'Failed to load documents from ./tests/test-files/error-document.graphql:'
        );
        expect(consoleErrorMock.mock.calls[0][0]).toBeSimilarStringTo('Syntax Error: Expected "{", found <EOF>.');
        // We can only use partial file path to the error file, because the error contains absolute path on the host machine
        expect(consoleErrorMock.mock.calls[0][0]).toBeSimilarStringTo('/tests/test-files/error-document.graphql:2:1');
        expect(consoleErrorMock.mock.calls[0][0]).toBeSimilarStringTo(`
          [FAILED] 1 | query
          [FAILED] 2 |
          [FAILED]   | ^
        `);
      }
    });

    test('No documents found - should throw error by default', async () => {
      expect.assertions(1);
      try {
        await generate(
          {
            verbose: true,
            schema: './tests/test-files/schema-dir/schema.ts',
            documents: './tests/test-files/document-file-does-not-exist.graphql',
            generates: {
              'src/test.ts': {
                plugins: ['typescript'],
              },
            },
          },
          false
        );
      } catch {
        expect(consoleErrorMock.mock.calls[0][0]).toBeSimilarStringTo(`
          [FAILED]       Unable to find any GraphQL type definitions for the following pointers:
          [FAILED]
          [FAILED]         - ./tests/test-files/document-file-does-not-exist.graphql
        `);
      }
    });

    test('No documents found - should not fail if ignoreNoDocuments=true', async () => {
      await generate(
        {
          verbose: true,
          ignoreNoDocuments: true,
          schema: './tests/test-files/schema-dir/schema.ts',
          documents: './tests/test-files/document-file-does-not-exist.graphql',
          generates: {
            'src/test.ts': {
              plugins: ['typescript'],
            },
          },
        },
        false
      );
      expect(consoleErrorMock).not.toHaveBeenCalled();
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
});
