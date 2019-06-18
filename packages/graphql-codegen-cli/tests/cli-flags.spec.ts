jest.mock('fs');
import { createConfig } from '../src/config';
import { join } from 'path';

const mockFsFile = (file: string, content: string) => require('fs').__setMockFiles(file, content);
const resetFs = () => require('fs').__resetMockFiles();
const mockConfig = (str: string, file = './codegen.yml') => mockFsFile(join(process.cwd(), file), str);
const createArgv = (str = ''): string[] => {
  const result = ['node', 'fake.js'];
  const regexp = /([^\s'"]+(['"])([^\2]*?)\2)|[^\s'"]+|(['"])([^\4]*?)\4/gi;

  let match;
  do {
    match = regexp.exec(str);
    if (match !== null) {
      result.push(match[1] || match[5] || match[0]);
    }
  } while (match !== null);

  return result;
};

describe('CLI Flags', () => {
  beforeEach(() => {
    resetFs();
  });

  it('Should create basic config using new yml API', async () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv();
    const config = await createConfig(args);
    expect(config).toEqual({
      schema: 'schema.graphql',
      generates: { 'file.ts': ['plugin'] },
    });
  });

  it('Should use different config file correctly with --config', async () => {
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
    const config = await createConfig(args);
    expect(config).toEqual({
      schema: 'schema.graphql',
      generates: { 'file.ts': ['plugin'] },
    });
  });

  it('Should set --watch with new YML api', async () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--watch');
    const config = await createConfig(args);
    expect(config.watch).toBeTruthy();
  });

  it('Should set watch and overwrite to default (false) with new YML api', async () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv();
    const config = await createConfig(args);
    expect(config.watch).not.toBeTruthy();
    expect(config.overwrite).not.toBeTruthy();
  });

  it('Should overwrite watch config using cli flags', async () => {
    mockConfig(`
        schema: schema.graphql
        watch: false
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--watch');
    const config = await createConfig(args);
    expect(config.watch).toBeTruthy();
  });

  it('Should set --overwrite with new YML api', async () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--overwrite');
    const config = await createConfig(args);
    expect(config.overwrite).toBeTruthy();
  });

  it('Should interpolate environmental variables in YML', async () => {
    process.env['SCHEMA_PATH'] = 'schema-env.graphql';
    mockConfig(`
        schema: \${SCHEMA_PATH}
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--overwrite');
    const config = await createConfig(args);
    expect(config.schema).toBe('schema-env.graphql');
  });

  it('Should interpolate environmental variables in YML and support default value', async () => {
    process.env['SCHEMA_PATH'] = '';

    mockConfig(`
        schema: \${SCHEMA_PATH:schema.graphql}
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--overwrite');
    const config = await createConfig(args);
    expect(config.schema).toBe('schema.graphql');
  });

  it('Should load require extensions provided by cli flags', async () => {
    process.env['SCHEMA_PATH'] = 'schema-env.graphql';
    mockConfig(`
        schema: \${SCHEMA_PATH}
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--require my-extension');

    try {
      await createConfig(args);
      expect(true).toBeFalsy();
    } catch (e) {
      expect(e.message).toBe(`Cannot find module 'my-extension' from 'config.ts'`);
    }
  });
});
