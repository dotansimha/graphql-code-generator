jest.mock('fs');
import { createConfig } from '../src/config';
import { join } from 'path';

const mockFsFile = (file: string, content: string) => require('fs').__setMockFiles(file, content);
const resetFs = () => require('fs').__resetMockFiles();
const createArgv = (str = ''): string[] => {
  const result = ['node', 'fake.js'];
  const regexp = /([^\s'"]+(['"])([^\2]*?)\2)|[^\s'"]+|(['"])([^\4]*?)\4/gi;

  let match;
  do {
    // Each call to exec returns the next regex match as an array
    match = regexp.exec(str);
    if (match !== null) {
      // Index 1 in the array is the captured group if it exists
      // Index 0 is the matched text, which we use if no captured group exists
      result.push(match[1] || match[5] || match[0]);
    }
  } while (match !== null);

  return result;
};
const mockConfig = (str: string, file = './codegen.yml') => mockFsFile(join(process.cwd(), file), str);

describe.only('CLI Flags', () => {
  beforeEach(() => {
    resetFs();
  });

  it('Should detect old cli flags and convert them correctly', () => {
    const args = createArgv('--template my-template --schema a.graphql --out out.ts');
    const config = createConfig(args);

    expect(config).toEqual({
      config: {},
      require: [],
      documents: [],
      schema: ['a.graphql'],
      generates: {
        'out.ts': {
          plugins: ['my-template']
        }
      }
    });
  });

  it('Should detect old cli flags and convert them correctly using header field', () => {
    const args = createArgv(
      '--template my-template --schema http://localhost:3000/graphql --header "Foo: bar" --out out.ts'
    );
    const config = createConfig(args);

    expect(config).toEqual({
      config: {},
      require: [],
      documents: [],
      schema: [
        {
          'http://localhost:3000/graphql': {
            headers: {
              Foo: 'bar'
            }
          }
        }
      ],
      generates: {
        'out.ts': {
          plugins: ['my-template']
        }
      }
    });
  });

  it('Should create basic config using new yml API', () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv();
    const config = createConfig(args);
    expect(config).toEqual({
      schema: 'schema.graphql',
      generates: { 'file.ts': ['plugin'] }
    });
  });

  it('Should use different config file correctly with --config', () => {
    mockConfig(
      `
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `,
      'other.yml'
    );
    const args = createArgv('--config other.yml');
    const config = createConfig(args);
    expect(config).toEqual({
      schema: 'schema.graphql',
      generates: { 'file.ts': ['plugin'] }
    });
  });

  it('Should set --watch with new YML api', () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--watch');
    const config = createConfig(args);
    expect(config.watch).toBeTruthy();
  });

  it('Should set watch and overwrite to default (false) with new YML api', () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv();
    const config = createConfig(args);
    expect(config.watch).not.toBeTruthy();
    expect(config.overwrite).not.toBeTruthy();
  });

  it('Should overwrite watch config using cli flags', () => {
    mockConfig(`
        schema: schema.graphql
        watch: false
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--watch');
    const config = createConfig(args);
    expect(config.watch).toBeTruthy();
  });

  it('Should set --overwrite with new YML api', () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--overwrite');
    const config = createConfig(args);
    expect(config.overwrite).toBeTruthy();
  });
});
