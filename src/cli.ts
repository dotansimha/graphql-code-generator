import * as commander from 'commander';
import {IntrospectionQuery} from 'graphql/utilities/introspectionQuery';
import {GeneratorTemplate} from './templates';
import {introspectionFromUrl} from './introspection-from-url';
import {introspectionFromFile} from './introspection-from-file';
import {documentsFromGlobs} from './documents-glob';
import {getTemplateGenerator} from './template-loader';

export interface TransformedCliOptions {
  introspection?: IntrospectionQuery;
  documents?: string[];
  template?: GeneratorTemplate;
  outPath?: string;
  isDev?: boolean;
}

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
    .option('-h, --header [header]', 'Header to add to the introspection HTTP request when using --url', collect, [])
    .option('-t, --template <template-name>', 'Language/platform name templates')
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
  const template = options['template'];
  const out = options['out'];

  if (!file && !url) {
    cliError('Please specify one of --file or --url flags!');
  }

  if (!template) {
    cliError('Please specify language/platform, using --template flag');
  }
};


export const transformOptions = (options): Promise<TransformedCliOptions> => {
  const file: string = options['file'];
  const url: string = options['url'];
  const documents: string[] = options['args'] || [];
  const template: string = options['template'];
  const out: string = options['out'];
  const headers: string[] = options['header'] || [];
  const isDev: boolean = options['dev'] !== undefined;
  const result: TransformedCliOptions = {};
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

    return result;
  });
};
