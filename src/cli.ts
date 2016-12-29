import * as commander from 'commander';
import {TransformedOptions} from './transform-engine';
import {introspectionFromUrl} from './introspection-from-url';
import {introspectionFromFile} from './introspection-from-file';
import {documentsFromGlobs} from './documents-glob';
import {getTemplateGenerator} from './template-loader';
import {introspectionFromExport} from './introspection-from-export';

function collect(val, memo) {
  memo.push(val);
  return memo;
}

export const initCLI = (args): commander.IExportedCommand => {
  commander
    .version(require('../package.json').version)
    .usage('graphql-codegen [options]')
    .option('-d, --dev', 'Turn on development mode - prints results to console')
    .option('-f, --file <filePath>', 'Parse local GraphQL introspection JSON file')
    .option('-u, --url <graphql-endpoint>', 'Parse remote GraphQL endpoint as introspection file')
    .option('-u, --export <export-file>', 'Path to a JavaScript (es5/6) file that exports (as default export) your `GraphQLSchema` object')
    .option('-h, --header [header]', 'Header to add to the introspection HTTP request when using --url', collect, [])
    .option('-t, --template <template-name>', 'Language/platform name templates')
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

export const validateCliOptions = (options) => {
  const file = options['file'];
  const url = options['url'];
  const fsExport = options['export'];
  const template = options['template'];
  const out = options['out'];

  if (!file && !url && !fsExport) {
    cliError('Please specify one of --file, --url or --export flags!');
  }

  if (!template) {
    cliError('Please specify language/platform, using --template flag');
  }
};

export const transformOptions = (options): Promise<TransformedOptions> => {
  const file: string = options['file'];
  const url: string = options['url'];
  const fsExport: string = options['export'];
  const documents: string[] = options['args'] || [];
  const template: string = options['template'];
  const out: string = options['out'];
  const headers: string[] = options['header'] || [];
  const isDev: boolean = options['dev'] !== undefined;
  const noSchema: boolean = !options['schema'];
  const noDocuments: boolean = !options['documents'];
  const result: TransformedOptions = {};
  let introspectionPromise;

  if (isDev) {
    console.log('Development mode is ON - output will print to console');
  }

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
  const generatorTemplatePromise = getTemplateGenerator(template);

  return Promise.all([
    introspectionPromise,
    documentsPromise,
    generatorTemplatePromise
  ]).then(([introspection, documents, generatorTemplate]) => {
    result.introspection = introspection;
    result.documents = documents;
    result.template = generatorTemplate;
    result.outPath = out;
    result.isDev = isDev;
    result.noSchema = noSchema;
    result.noDocuments = noDocuments;

    return result;
  });
};
