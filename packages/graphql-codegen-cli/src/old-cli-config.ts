import * as commander from 'commander';
import { getGraphQLProjectConfig, ConfigNotFoundError } from 'graphql-config';
import { Types } from 'graphql-codegen-core';
import spinner from './spinner';

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

export const cliError = (err: any, exitOnError = true) => {
  spinner.fail();
  let msg: string;

  if (err instanceof Error) {
    msg = err.message || err.toString();
  } else if (typeof err === 'string') {
    msg = err;
  } else {
    msg = JSON.stringify(err);
  }

  console['error'](msg);

  if (exitOnError) {
    process.exit(1);
  }

  return;
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

function transformTemplatesToPlugins(options: CLIOptions): any[] {
  if (options.template === 'ts' || options.template === 'typescript') {
    return [
      {
        'typescript-common': {},
        'typescript-client': {},
        'typescript-server': {}
      }
    ];
  }

  return [];
}

export function createConfigFromOldCli(options: CLIOptions): Types.Config {
  validateCliOptions(options);

  const configObject: Types.Config = {
    schema: [options.schema, options.clientSchema].filter(s => s),
    generates: {
      [options.out]: transformTemplatesToPlugins(options)
    },
    silent: options.silent,
    watch: options.watch,
    require: options.require
  };

  return configObject;
}
