import * as commander from 'commander';
import { introspectionFromFile } from './loaders/introspection-from-file';
import { introspectionFromUrl } from './loaders/introspection-from-url';
import { introspectionFromExport } from './loaders/introspection-from-export';
import { documentsFromGlobs } from './utils/documents-glob';
import { getGeneratorConfig } from 'graphql-codegen-generators';

export interface CLIOptions {
  file?: string;
  url?: string;
  'export'?: string;
  args?: string[];
  template?: string;
  out?: string;
  headers?: string[];
  schema?: any;
  documents?: any;
}

function collect(val, memo) {
  memo.push(val);

  return memo;
}

export const initCLI = (args): any => {
  commander
    .version(require('../../../package.json').version)
    .usage('gql-gen [options]')
    .option('-f, --file <filePath>', 'Parse local GraphQL introspection JSON file')
    .option('-u, --url <graphql-endpoint>', 'Parse remote GraphQL endpoint as introspection file')
    .option('-u, --export <export-file>', 'Path to a JavaScript (es5/6) file that exports (as default export) your `GraphQLSchema` object')
    .option('-h, --header [header]', 'Header to add to the introspection HTTP request when using --url', collect, [])
    .option('-t, --template <template-name>', 'Language/platform name templates', collect, [])
    .option('-m, --no-schema', 'Generates only client side documents, without server side schema types')
    .option('-c, --no-documents', 'Generates only server side schema types, without client side documents')
    .option('-o, --out <path>', 'Output file(s) path', String, './')
    .arguments('<options> [documents...]')
    .parse(args);

  return commander;
};

export const cliError = (err: string) => {
  if (typeof err === 'object') {
    console.log(err);
  }

  console.error('Error: ' + err);
  process.exit(1);

  return;
};

export const validateCliOptions = (options: CLIOptions) => {
  const file = options.file;
  const url = options.url;
  const fsExport = options.export;
  const template = options.template;

  if (!file && !url && !fsExport) {
    cliError('Please specify one of --file, --url or --export flags!');
  }

  if (!template) {
    cliError('Please specify language/platform, using --template flag');
  }
};

export const executeWithOptions = (options: CLIOptions): Promise<any> => {
  validateCliOptions(options);

  const file: string = options.file;
  const url: string = options.url;
  const fsExport: string = options.export;
  const documents: string[] = options.args|| [];
  const template: string = options.template;
  const out: string = options.out;
  const headers: string[] = options.headers;
  const noSchema: boolean = !options.schema;
  const noDocuments: boolean = !options.documents;
  let introspectionPromise;

  if (file) {
    introspectionPromise = introspectionFromFile(file);
  }
  else if (url) {
    introspectionPromise = introspectionFromUrl(url, headers);
  }
  else if (fsExport) {
    introspectionPromise = introspectionFromExport(fsExport);
  }

  const documentsPromise = documentsFromGlobs(documents);
  const templateFn = getGeneratorConfig(template);

  console.log(templateFn);

  return Promise.resolve([]);
};