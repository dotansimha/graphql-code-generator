import { generate } from '../src/generate-and-save';
import * as fs from '../src/utils/file-system';
import { Types } from '@graphql-codegen/plugin-helpers';

const SIMPLE_TEST_SCHEMA = `type MyType { f: String } type Query { f: String }`;

describe('generate-and-save', () => {
  beforeEach(() => {
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
    // forces file to exist
    const fileExistsSpy = jest.spyOn(fs, 'fileExists');
    fileExistsSpy.mockImplementation(file => file === filename);

    const output = await generate(
      {
        schema: SIMPLE_TEST_SCHEMA,
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
    // makes sure it doesn't write a new file
    expect(writeSpy).toHaveBeenCalled();
  });
  test('should override generated files', async () => {
    jest.unmock('fs');
    const fs = await import('fs');
    if (!fs.existsSync('./temp')) {
      fs.mkdirSync('./temp');
    }
    if (fs.existsSync('./temp/output-graphql.tsx')) {
      fs.unlinkSync('./temp/output-graphql.tsx');
    }
    fs.writeFileSync(
      './temp/input-graphql.tsx',
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
          documents: './temp/*-graphql.tsx',
          generates: {
            './temp/output-graphql.tsx': {
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
});
