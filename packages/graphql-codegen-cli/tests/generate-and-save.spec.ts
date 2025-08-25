import { dirname, join } from 'path';
import logSymbols from 'log-symbols';
import { Types } from '@graphql-codegen/plugin-helpers';
import '@graphql-codegen/testing';
import makeDir from 'make-dir';
import { createContext } from '../src/config.js';
import { generate } from '../src/generate-and-save.js';
import * as fs from '../src/utils/file-system.js';
import { setLogger } from '../src/utils/logger.js';

const SIMPLE_TEST_SCHEMA = `type MyType { f: String } type Query { f: String }`;

const inputFile = join(__dirname, '../temp/input-graphql.tsx');
const outputFile = join(__dirname, '../temp/output-graphql.tsx');

describe('generate-and-save', () => {
  test('allow to specify overwrite for specific output (should write file)', async () => {
    const filename = 'overwrite.ts';
    const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());

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
    const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());
    // forces file to exist
    const fileReadSpy = vi.spyOn(fs, 'readFile');
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
    const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());

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
    const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());
    // forces file to exist
    const fileReadSpy = vi.spyOn(fs, 'readFile');
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
    const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());
    const readSpy = vi.spyOn(fs, 'readFile').mockImplementation(() => Promise.resolve(''));
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
    vi.unmock('fs');
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
    const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());

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
    const writeSpy = vi.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());

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

    beforeEach(() => {
      // By default, the NODE_ENV is set to 'test', and this is used to silent console errors.
      // For these tests below, we want to see what's being logged out to console errors.
      process.env.NODE_ENV = 'not_test_so_error';
      vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('Schema syntax error - should print native GraphQLError', async () => {
      expect.assertions(1);
      const outputErrorMock = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
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
          "[FAILED] Failed to load schema from ./tests/test-files/schema-dir/error-schema.graphql:
          [FAILED] Syntax Error: Expected Name, found "!".

          [FAILED] ${cwd}/tests/test-files/schema-dir/error-schema.graphql:2:15
          [FAILED] 1 | type Query {
          [FAILED] 2 |   foo: String!!
          [FAILED]   |               ^
          [FAILED] 3 | }

          [FAILED] GraphQL Code Generator supports:

          [FAILED] - ES Modules and CommonJS exports (export as default or named export "schema")
          [FAILED] - Introspection JSON File
          [FAILED] - URL of GraphQL endpoint
          [FAILED] - Multiple files with type definitions (glob expression)
          [FAILED] - String in config file

          [FAILED] Try to use one of above options and run codegen again.

          "
        `);
      }
    });

    test('Document syntax error - should print native GraphQLError', async () => {
      expect.assertions(1);
      const outputErrorMock = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
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
          "[FAILED] Failed to load documents from ./tests/test-files/error-document.graphql:
          [FAILED] Syntax Error: Expected "{", found <EOF>.

          [FAILED] ${cwd}/tests/test-files/error-document.graphql:2:1
          [FAILED] 1 | query
          [FAILED] 2 |
          [FAILED]   | ^
          "
        `);
      }
    });

    test('No documents found - should throw error by default', async () => {
      expect.assertions(1);
      const outputErrorMock = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
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
          [FAILED]       Unable to find any GraphQL type definitions for the following pointers:
          [FAILED]         - ./tests/test-files/document-file-does-not-exist.graphql
          "
        `);
      }
    });

    test('No documents found - should not fail if ignoreNoDocuments=true', async () => {
      const outputErrorMock = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
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
      const outputErrorMock = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
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
          [FAILED]       Unable to find any GraphQL type definitions for the following pointers:
          [FAILED]         - ../test-documents/empty.graphql
          "
        `);
      }
    });

    test('No documents found - GraphQL Config - should not fail if ignoreNoDocuments=true', async () => {
      const outputErrorMock = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
      vi.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());
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
      warn: vi.fn(),
      error: vi.fn(),
    };

    beforeEach(() => {
      setLogger(mockLogger);
      vi.resetAllMocks();
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
