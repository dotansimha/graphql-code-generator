import { useMonorepo } from '@graphql-codegen/testing';
import { generate } from '../src/generate-and-save';
import * as fs from '../src/utils/file-system';
import { Types } from '@graphql-codegen/plugin-helpers';
import { dirname, join } from 'path';
import makeDir from 'make-dir';

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
    const writeSpy = jest.spyOn(fs, 'writeSync').mockImplementation();

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
    const writeSpy = jest.spyOn(fs, 'writeSync').mockImplementation();
    // forces file to exist
    const fileExistsSpy = jest.spyOn(fs, 'fileExists');
    fileExistsSpy.mockImplementation(file => file === filename);

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
    expect(fileExistsSpy).toHaveBeenCalledWith(filename);
    // makes sure it doesn't write a new file
    expect(writeSpy).not.toHaveBeenCalled();
  });

  test('should use global overwrite option and write a file', async () => {
    const filename = 'overwrite.ts';
    const writeSpy = jest.spyOn(fs, 'writeSync').mockImplementation();

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
    const writeSpy = jest.spyOn(fs, 'writeSync').mockImplementation();
    // forces file to exist
    const fileExistsSpy = jest.spyOn(fs, 'fileExists');
    fileExistsSpy.mockImplementation(file => file === filename);

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
    expect(fileExistsSpy).toHaveBeenCalledWith(filename);
    // makes sure it doesn't write a new file
    expect(writeSpy).not.toHaveBeenCalled();
  });

  test('should overwrite a file by default', async () => {
    const filename = 'overwrite.ts';
    const writeSpy = jest.spyOn(fs, 'writeSync').mockImplementation();
    const readSpy = jest.spyOn(fs, 'readSync').mockImplementation();
    readSpy.mockImplementation(_f => '');
    // forces file to exist
    const fileExistsSpy = jest.spyOn(fs, 'fileExists');
    fileExistsSpy.mockImplementation(file => file === filename);

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
      {}
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
    const writeSpy = jest.spyOn(fs, 'writeSync').mockImplementation();

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
});
