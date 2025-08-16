import { dirname, join } from 'path';
import logSymbols from 'log-symbols';
import { Types } from '@graphql-codegen/plugin-helpers';
import { useMonorepo } from '@graphql-codegen/testing';
import makeDir from 'make-dir';
import { createContext } from '../src/config.js';
import { generate } from '../src/generate-and-save.js';
import * as fs from '../src/utils/file-system.js';
import { setLogger } from '../src/utils/logger.js';

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
    const originalNodeEnv = process.env.NODE_ENV;

    let outputErrorMock: jest.SpyInstance;

    beforeEach(() => {
      // By default, the NODE_ENV is set to 'test', and this is used to silent console errors.
      // For these tests below, we want to see what's being logged out to console errors.
      process.env.NODE_ENV = 'not_test_so_error';

      jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
      outputErrorMock = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
      outputErrorMock.mockReset();
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('Schema syntax error - should print native GraphQLError', async () => {
      expect.assertions(1);
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
        const cwd = process.cwd(); // cwd is different for every machine, remember to replace local path with this after updating snapshot
        expect(outputErrorMock.mock.calls[0][0]).toMatchInlineSnapshot(`
          "[31m[FAILED][39m Failed to load schema from ./tests/test-files/schema-dir/error-schema.graphql:
          [31m[FAILED][39m Syntax Error: Expected Name, found "!".

          [31m[FAILED][39m ${cwd}/tests/test-files/schema-dir/error-schema.graphql:2:15
          [31m[FAILED][39m 1 | type Query {
          [31m[FAILED][39m 2 |   foo: String!!
          [31m[FAILED][39m   |               ^
          [31m[FAILED][39m 3 | }

          [31m[FAILED][39m GraphQL Code Generator supports:

          [31m[FAILED][39m - ES Modules and CommonJS exports (export as default or named export "schema")
          [31m[FAILED][39m - Introspection JSON File
          [31m[FAILED][39m - URL of GraphQL endpoint
          [31m[FAILED][39m - Multiple files with type definitions (glob expression)
          [31m[FAILED][39m - String in config file

          [31m[FAILED][39m Try to use one of above options and run codegen again.

          "
        `);
      }
    });

    test('Document syntax error - should print native GraphQLError', async () => {
      expect.assertions(1);
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
        const cwd = process.cwd(); // cwd is different for every machine, remember to replace local path with this after updating snapshot
        expect(outputErrorMock.mock.calls[0][0]).toMatchInlineSnapshot(`
          "[31m[FAILED][39m Failed to load documents from ./tests/test-files/error-document.graphql:
          [31m[FAILED][39m Syntax Error: Expected "{", found <EOF>.

          [31m[FAILED][39m ${cwd}/tests/test-files/error-document.graphql:2:1
          [31m[FAILED][39m 1 | query
          [31m[FAILED][39m 2 |
          [31m[FAILED][39m   | ^
          "
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
        expect(outputErrorMock.mock.calls[0][0]).toMatchInlineSnapshot(`
          "
          [31m[FAILED][39m       Unable to find any GraphQL type definitions for the following pointers:
          [31m[FAILED][39m         - ./tests/test-files/document-file-does-not-exist.graphql
          "
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
      expect(outputErrorMock).not.toHaveBeenCalled();
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
        expect(outputErrorMock.mock.calls[0][0]).toMatchInlineSnapshot(`
          "
          [31m[FAILED][39m       Unable to find any GraphQL type definitions for the following pointers:
          [31m[FAILED][39m         - ../test-documents/empty.graphql
          "
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

      expect(outputErrorMock).not.toHaveBeenCalled();
    });
  });

  describe('config.allowPartialOutputs', () => {
    const mockLogger: any = {
      warn: jest.fn(),
      error: jest.fn(),
    };

    beforeEach(() => {
      setLogger(mockLogger);
    });

    test('when allowPartialOutputs=true - writes partial success and does not throw', async () => {
      const invalidSchema = /* GraphQL */ `
        type A {
          id: WRONG_TYPE!
        }
      `;
      const validSchema = /* GraphQL */ `
        type B {
          id: ID!
        }
      `;
      const output = await generate(
        {
          allowPartialOutputs: true,
          generates: {
            'src/a.ts': {
              schema: invalidSchema,
              plugins: ['typescript'],
            },
            'src/b.ts': {
              schema: validSchema,
              plugins: ['typescript'],
            },
          },
        },
        false
      );

      expect(output.length).toBe(1);
      expect(output[0].filename).toBe('src/b.ts');
      expect(mockLogger.warn.mock.calls[0][0]).toBeSimilarStringTo(
        `${logSymbols.warning} One or more errors occurred, some files were generated. To prevent any output on errors, set config.allowPartialOutputs=false`
      );
    });

    test('when allowPartialOutputs=true - complete failure throws', async () => {
      expect.assertions(2);

      try {
        const invalidSchema = /* GraphQL */ `
          type A {
            id: WRONG_TYPE!
          }
        `;
        await generate(
          {
            allowPartialOutputs: true,
            generates: {
              'src/a.ts': {
                schema: invalidSchema,
                plugins: ['typescript'],
              },
              'src/b.ts': {
                schema: invalidSchema,
                plugins: ['typescript'],
              },
            },
          },
          false
        );
      } catch {
        expect(mockLogger.warn).not.toHaveBeenCalled();
        expect(mockLogger.error).not.toHaveBeenCalled();
      }
    });

    test('when allowPartialOutputs=false - does not write partial success and throws', async () => {
      expect.assertions(1);

      const invalidSchema = /* GraphQL */ `
        type A {
          id: WRONG_TYPE!
        }
      `;
      const validSchema = /* GraphQL */ `
        type B {
          id: ID!
        }
      `;

      try {
        await generate(
          {
            allowPartialOutputs: false,
            generates: {
              'src/a.ts': {
                schema: invalidSchema,
                plugins: ['typescript'],
              },
              'src/b.ts': {
                schema: validSchema,
                plugins: ['typescript'],
              },
            },
          },
          false
        );
      } catch {
        expect(mockLogger.error.mock.calls[0][0]).toBeSimilarStringTo(
          `${logSymbols.error} One or more errors occurred, no files were generated. To allow output on errors, set config.allowPartialOutputs=true`
        );
      }
    });

    test('when allowPartialOutputs=false - complete failure throws', async () => {
      expect.assertions(2);

      try {
        const invalidSchema = /* GraphQL */ `
          type A {
            id: WRONG_TYPE!
          }
        `;
        await generate(
          {
            allowPartialOutputs: false,
            generates: {
              'src/a.ts': {
                schema: invalidSchema,
                plugins: ['typescript'],
              },
              'src/b.ts': {
                schema: invalidSchema,
                plugins: ['typescript'],
              },
            },
          },
          false
        );
      } catch {
        expect(mockLogger.warn).not.toHaveBeenCalled();
        expect(mockLogger.error).not.toHaveBeenCalled();
      }
    });
  });
});
