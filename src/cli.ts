import * as commander from 'commander';
import * as fs from 'fs';
import * as glob from 'glob';
import {IntrospectionQuery} from 'graphql/utilities/introspectionQuery';
import {GeneratorTemplate, generators} from './templates';

export interface TransformedCliOptions {
  introspection?: IntrospectionQuery;
  documents?: string[];
  template?: GeneratorTemplate;
  outPath?: string;
}

export const initCLI = (args): commander.IExportedCommand => {
  commander
    .version('0.0.1')
    .usage('graphql-codegen [options]')
    .option('-f, --file <filePath>', 'Parse local GraphQL introspection JSON file')
    .option('-u, --url <graphql-endpoint>', 'Parse remote GraphQL endpoint as introspection file')
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
  const documents: string[] = options['args'];

  if (!file && !url) {
    cliError('Please specify one of --file or --url flags!');
  }

  if (!template ) {
    cliError('Please specify language/platform, using --template flag');
  }

  if (!documents || documents.length === 0) {
    cliError('Please specify GraphQL documents input');
  }
};

const getGeneratorTemplate = (templateName: string): GeneratorTemplate => {
  return generators.find(item => (item.aliases || []).indexOf(templateName.toLowerCase()) > -1);
};

export const transformOptions = (options): Promise<TransformedCliOptions> => {
  const file: string = options['file'];
  const url: string = options['url'];
  const documents: string[] = options['args'] || [];
  const template: string = options['template'];
  const out: string = options['out'];
  const result: TransformedCliOptions = {};
  let introspectionPromise;

  if (file) {
    introspectionPromise = new Promise<IntrospectionQuery>((resolve, reject) => {
      if (fs.existsSync(file)) {
        try {
          const fileContent = fs.readFileSync(file, 'utf8');

          if (!fileContent) {
            reject(`Unable to read local introspection file: ${file}`);
          }

          resolve(<IntrospectionQuery>JSON.parse(fileContent));
        }
        catch (e) {
          reject(e);
        }
      }
      else {
        reject(`Unable to locate local introspection file: ${file}`);
      }
    });
  }
  else if (url) {
    // TODO: Support GraphQL URL
  }

  const documentsPromises = documents.map((documentGlob: string) => {
    return new Promise<string[]>((resolve, reject) => {
      glob(documentGlob, (err, files) => {
        if (err) {
          reject(err);
        }

        if (!files || files.length === 0) {
          reject(`Unable to locate files matching glob definition: ${documentGlob}`);
        }

        resolve(files);
      });
    });
  });

  const generatorTemplatePromise = new Promise<GeneratorTemplate>((resolve, reject) => {
    const generatorTemplate = getGeneratorTemplate(template);

    if (generatorTemplate) {
      resolve(generatorTemplate);
    }
    else {
      const allowedTemplates = generators.map(item => item.aliases).reduce((a, b) => a.concat(b)).join(', ');
      reject(`Unknown template language specified: ${template}, available are: ${allowedTemplates}`);
    }
  });

  const documentsPromise = Promise.all(documentsPromises).then((files: string[][]) => {
    return files.reduce((a, b) => {
      return a.concat(b);
    });
  });

  return Promise.all([
    introspectionPromise,
    documentsPromise,
    generatorTemplatePromise
  ]).then(([introspection, documents, generatorTemplate]) => {
    result.introspection = introspection;
    result.documents = documents;
    result.template = generatorTemplate;
    result.outPath = out;

    return result;
  });
};
