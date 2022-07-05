import { TempDir } from './utils.js';
import { createContext, parseArgv } from '../src/config.js';

const mockConfig = (str: string, file = './codegen.yml') => temp.createFile(file, str);
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

const temp = new TempDir();

describe('CLI Flags', () => {
  beforeEach(() => {
    temp.clean();
    jest.spyOn(process, 'cwd').mockImplementation(() => temp.dir);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    temp.deleteTempDir();
  });

  it('Should create basic config using new yml API', async () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv();
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.schema).toEqual('schema.graphql');
    expect(config.generates).toEqual({ 'file.ts': ['plugin'] });
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
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.schema).toEqual('schema.graphql');
    expect(config.generates).toEqual({ 'file.ts': ['plugin'] });
  });

  it('Should set --watch with new YML api', async () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--watch');
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
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
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.watch).not.toBeTruthy();
    expect(config.overwrite).not.toBeTruthy();
  });

  it('Should overwrite watch config using cli flag to true', async () => {
    mockConfig(`
        schema: schema.graphql
        watch: false
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--watch');
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.watch).toBeTruthy();
  });

  it('Should overwrite watch config using cli flags to false', async () => {
    mockConfig(`
        schema: schema.graphql
        watch: true
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--watch=false');
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.watch).toBeFalsy();
  });

  it('Should overwrite ignoreNoDocuments config using cli flags to false', async () => {
    mockConfig(`
        schema: schema.graphql
        ignoreNoDocuments: true
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--ignore-no-documents=false');
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.ignoreNoDocuments).toBeFalsy();
  });

  it('Should overwrite ignoreNoDocuments config using cli flags to true', async () => {
    mockConfig(`
        schema: schema.graphql
        ignoreNoDocuments: false
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--ignore-no-documents');
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.ignoreNoDocuments).toBeTruthy();
  });

  it('Should set --overwrite with new YML api', async () => {
    mockConfig(`
        schema: schema.graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--overwrite');
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.overwrite).toBeTruthy();
  });

  it('Should interpolate environmental variables in YML', async () => {
    process.env.SCHEMA_PATH = 'schema-env.graphql';
    mockConfig(`
        schema: \${SCHEMA_PATH}
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--overwrite');
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.schema).toBe('schema-env.graphql');
  });

  it('Should interpolate multiple environmental variables in YML', async () => {
    process.env.SCHEMA_SCHEME = 'https';
    process.env.SCHEMA_HOST = 'localhost';
    mockConfig(`
        schema: \${SCHEMA_SCHEME}://\${SCHEMA_HOST}/graphql
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--overwrite');
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.schema).toBe('https://localhost/graphql');
  });

  it('Should interpolate environmental variables in YML and support default value', async () => {
    process.env.SCHEMA_PATH = '';

    mockConfig(`
        schema: \${SCHEMA_PATH:schema.graphql}
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--overwrite');
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.schema).toBe('schema.graphql');
  });

  it('Should interpolate environmental variables in YML and support default value containing ":"', async () => {
    process.env.SCHEMA_PATH = '';

    mockConfig(`
        schema: \${SCHEMA_PATH:http://url-to-graphql-api}
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--overwrite');
    const context = await createContext(parseArgv(args));
    const config = context.getConfig();
    expect(config.schema).toBe('http://url-to-graphql-api');
  });

  it('Should load require extensions provided by cli flags', async () => {
    process.env.SCHEMA_PATH = 'schema-env.graphql';
    mockConfig(`
        schema: \${SCHEMA_PATH}
        generates:
            file.ts:
                - plugin
    `);
    const args = createArgv('--require my-extension');

    try {
      await createContext(parseArgv(args));
      expect(true).toBeFalsy();
    } catch (e) {
      expect(e.code).toEqual('MODULE_NOT_FOUND');
    }
  });
});
