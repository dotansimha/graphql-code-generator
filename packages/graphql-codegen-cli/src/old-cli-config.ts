import * as commander from 'commander';
import { getGraphQLProjectConfig, ConfigNotFoundError } from 'graphql-config';
import { Types } from 'graphql-codegen-core';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { cliError } from './utils/cli-error';

export interface CLIOptions {
  schema?: string;
  clientSchema?: string;
  args?: string[];
  template?: string;
  project?: string;
  out?: string;
  header?: string[];
  skipSchema?: any;
  skipDocuments?: any;
  config?: string;
  require?: string[];
  overwrite?: boolean;
  watch?: boolean;
  silent?: boolean;
  mergeSchema?: string;
  exitOnError?: boolean;
  templateConfig?: { [key: string]: any };
}

function collect<T>(val: T, memo: T[]) {
  memo.push(val);

  return memo;
}

export const initCLI = (args: any): CLIOptions => {
  commander
    .usage('gql-gen [options]')
    .option(
      '-s, --schema <path>',
      'Path to GraphQL schema: local JSON file, GraphQL endpoint, local file that exports GraphQLSchema/AST/JSON'
    )
    .option(
      '-cs, --clientSchema <path>',
      'Path to GraphQL client schema: local JSON file, local file that exports GraphQLSchema/AST/JSON'
    )
    .option(
      '-h, --header [header]',
      'Header to add to the introspection HTTP request when using --url/--schema with url',
      collect,
      []
    )
    .option(
      '-t, --template <template-name>',
      'Language/platform name templates, or a name of NPM modules that `export default` GqlGenConfig object'
    )
    .option('-p, --project <project-path>', 'Project path(s) to scan for custom template files')
    .option('--config <json-file>', 'Codegen configuration file, defaults to: ./gql-gen.json')
    .option('-m, --skip-schema', 'Generates only client side documents, without server side schema types')
    .option('-c, --skip-documents', 'Generates only server side schema types, without client side documents')
    .option('-o, --out <path>', 'Output file(s) path', String, './')
    .option('-r, --require [require]', 'module to preload (option can be repeated)', collect, [])
    .option('-ow, --no-overwrite', 'Skip file writing if the output file(s) already exists in path')
    .option('-w, --watch', 'Watch for changes and execute generation automatically')
    .option('--silent', 'Does not print anything to the console')
    .option('-ms, --merge-schema <merge-logic>', 'Merge schemas with custom logic')
    .arguments('<options> [documents...]')
    .parse(args);

  return (commander as any) as CLIOptions;
};

export const validateCliOptions = (options: CLIOptions) => {
  const schema = options.schema;
  const template = options.template;
  const project = options.project;

  if (!schema) {
    try {
      const graphqlProjectConfig = getGraphQLProjectConfig(project);
      options.schema = graphqlProjectConfig.schemaPath;
    } catch (e) {
      if (e instanceof ConfigNotFoundError) {
        cliError('Flag --schema is missing!');
      }
    }
  }

  if (!template && !project) {
    cliError('Please specify language/platform, using --template flag!');
  }
};

function transformTemplatesToPlugins(
  options: CLIOptions,
  templateSpecificConfig: { [key: string]: any } = {}
): Types.ConfiguredOutput {
  if (options.template === 'ts' || options.template === 'typescript') {
    return {
      config: templateSpecificConfig,
      plugins: [
        templateSpecificConfig.printTime ? 'time' : null,
        'typescript-common',
        options.skipDocuments ? null : 'typescript-client',
        options.skipSchema ? null : 'typescript-server'
      ].filter(s => s)
    };
  }

  return { plugins: [] };
}

export function createConfigFromOldCli(options: CLIOptions): Types.Config {
  validateCliOptions(options);

  let rootConfig: { [key: string]: any } = {};
  const configPath = options.config ? options.config : existsSync(join(process.cwd(), './gql-gen.json'));

  if (configPath && typeof configPath === 'string') {
    const rawObj = JSON.parse(readFileSync(configPath, 'utf-8'));
    rootConfig = (rawObj || {}).generatorConfig || {};
  }

  const configObject: Types.Config = {
    schema: [options.schema, options.clientSchema].filter(s => s),
    documents: options.args || [],
    config: rootConfig,
    generates: {
      [options.out]: transformTemplatesToPlugins(options, {
        ...rootConfig,
        ...(options.templateConfig || {})
      })
    },
    silent: options.silent,
    watch: options.watch,
    require: options.require
  };

  return configObject;
}
