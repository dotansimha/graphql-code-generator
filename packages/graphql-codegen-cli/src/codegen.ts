import * as commander from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as validUrl from 'valid-url';
import { GraphQLSchema } from 'graphql';
import * as isGlob from 'is-glob';

import { introspectionFromFile } from './loaders/schema/introspection-from-file';
import { introspectionFromUrl } from './loaders/schema/introspection-from-url';
import { schemaFromExport } from './loaders/schema-from-export';
import { documentsFromGlobs } from './utils/documents-glob';
import { loadDocumentsSources } from './loaders/documents/document-loader';
import { scanForTemplatesInPath } from './loaders/templates-scanner';
import { ALLOWED_CUSTOM_TEMPLATE_EXT, compileTemplate } from 'graphql-codegen-compiler';
import {
  CustomProcessingFunction,
  debugLog,
  EInputType,
  FileOutput,
  GeneratorConfig,
  introspectionToGraphQLSchema,
  isGeneratorConfig,
  schemaToTemplateContext,
  transformDocument,
  logger
} from 'graphql-codegen-core';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export interface CLIOptions {
  file?: string;
  url?: string;
  export?: string;
  schema?: string;
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
}

interface GqlGenConfig {
  flattenTypes?: boolean;
  primitives?: {
    String: string;
    Int: string;
    Float: string;
    Boolean: string;
    ID: string;
  };
  customHelpers?: { [helperName: string]: string };
  generatorConfig?: { [configName: string]: any };
}

function collect(val, memo) {
  memo.push(val);

  return memo;
}

export const initCLI = (args): CLIOptions => {
  commander
    .usage('gql-gen [options]')
    .option('-f, --file <filePath>', 'Parse local GraphQL introspection JSON file')
    .option('-u, --url <graphql-endpoint>', 'Parse remote GraphQL endpoint as introspection file')
    .option(
      '-e, --export <export-file>',
      'Path to a JavaScript (es5/6) file that exports (as default export) your `GraphQLSchema` object'
    )
    .option(
      '-s, --schema <path>',
      'Path to GraphQL schema: local JSON file, GraphQL endpoint, local file that exports GraphQLSchema/AST/JSON'
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
    .arguments('<options> [documents...]')
    .parse(args);

  return (commander as any) as CLIOptions;
};

export const cliError = (err: string) => {
  logger.error(err);
  process.exit(1);

  return;
};

export const validateCliOptions = (options: CLIOptions) => {
  const schema = options.schema;
  const file = options.file;
  const url = options.url;
  const fsExport = options.export;
  const template = options.template;
  const project = options.project;

  if (!schema && !file && !url && !fsExport) {
    cliError('Please specify one of --schema, --file, --url or --export flags!');
  }

  if (file) {
    logger.warn(`--file is deprecated, use --schema instead.`);
  } else if (url) {
    logger.warn(`--url is deprecated, use --schema instead.`);
  } else if (fsExport) {
    logger.warn(`--export is deprecated, use --schema instead.`);
  }

  if (!template && !project) {
    cliError(
      'Please specify language/platform, using --template flag, or specify --project to generate with custom project!'
    );
  }
};

export const executeWithOptions = async (options: CLIOptions): Promise<FileOutput[]> => {
  validateCliOptions(options);

  const schema: string = options.schema;
  const file: string = options.file;
  const url: string = options.url;
  const fsExport: string = options.export;
  const documents: string[] = options.args || [];
  let template: string = options.template;
  const project: string = options.project;
  const gqlGenConfigFilePath: string = options.config || './gql-gen.json';
  const out: string = options.out || './';
  const headers: string[] = options.header;
  const generateSchema: boolean = !options.skipSchema;
  const generateDocuments: boolean = !options.skipDocuments;
  const modulesToRequire: string[] = options.require || [];
  let schemaExportPromise: Promise<GraphQLSchema>;

  modulesToRequire.forEach(mod => require(mod));

  if (schema) {
    if (validUrl.isUri(schema)) {
      schemaExportPromise = introspectionFromUrl(schema, headers).then(introspectionToGraphQLSchema);
    } else if (fs.existsSync(schema)) {
      if (isGlob(schema)) {
        // const typeDefsFiles =
      } else {
        const extension = path.extname(schema);

        if (!extension) {
          cliError('Invalid --schema local path provided, unable to find the file extension!');
        } else if (extension === '.json') {
          schemaExportPromise = introspectionFromFile(schema).then(introspectionToGraphQLSchema);
        } else {
          schemaExportPromise = schemaFromExport(schema);
        }
      }
    } else {
      cliError('Invalid --schema provided, please use a path to local file or HTTP endpoint');
    }
  } else if (file) {
    schemaExportPromise = introspectionFromFile(file).then(introspectionToGraphQLSchema);
  } else if (url) {
    schemaExportPromise = introspectionFromUrl(url, headers).then(introspectionToGraphQLSchema);
  } else if (fsExport) {
    schemaExportPromise = schemaFromExport(fsExport);
  }

  if (!schemaExportPromise) {
    cliError('Invalid --schema provided, please use a path to local file or HTTP endpoint');
  }

  const graphQlSchema = await schemaExportPromise;

  if (process.env.VERBOSE !== undefined) {
    logger.info(`GraphQL Schema is: `, graphQlSchema);
  }

  const context = schemaToTemplateContext(graphQlSchema);
  debugLog(`[executeWithOptions] Schema template context build, the result is: `);
  Object.keys(context).forEach(key => {
    if (Array.isArray(context[key])) {
      debugLog(`Total of ${key}: ${context[key].length}`);
    }
  });

  const transformedDocuments = transformDocument(
    graphQlSchema,
    loadDocumentsSources(await documentsFromGlobs(documents))
  );
  let templateConfig: GeneratorConfig | CustomProcessingFunction | null = null;

  if (template && template !== '') {
    debugLog(`[executeWithOptions] using template: ${template}`);

    // Backward compatibility for older versions
    if (
      template === 'ts' ||
      template === 'ts-single' ||
      template === 'typescript' ||
      template === 'typescript-single'
    ) {
      template = 'graphql-codegen-typescript-template';
    } else if (template === 'ts-multiple' || template === 'typescript-multiple') {
      template = 'graphql-codegen-typescript-template-multiple';
    }

    const localFilePath = path.resolve(process.cwd(), template);
    const localFileExists = fs.existsSync(localFilePath);
    const templateFromExport = require(localFileExists ? localFilePath : template);

    if (!templateFromExport) {
      throw new Error(`Unknown codegen template: ${template}, please make sure it's installed using npm/Yarn!`);
    } else {
      templateConfig = templateFromExport.default || templateFromExport.config || templateFromExport;
    }
  }

  debugLog(`[executeWithOptions] using project: ${project}`);

  const configPath = path.resolve(process.cwd(), gqlGenConfigFilePath);
  let config: GqlGenConfig = null;

  if (fs.existsSync(configPath)) {
    logger.info('Loading config file from: ', configPath);
    config = JSON.parse(fs.readFileSync(configPath).toString()) as GqlGenConfig;
    debugLog(`[executeWithOptions] Got project config JSON: `, config);
  }

  if (project && project !== '') {
    if (config === null) {
      throw new Error(
        `To use project feature, please specify --config path or create gql-gen.json in your project root!`
      );
    }

    const templates = scanForTemplatesInPath(project, ALLOWED_CUSTOM_TEMPLATE_EXT);
    const resolvedHelpers: { [key: string]: Function } = {};

    Object.keys(config.customHelpers || {}).map(helperName => {
      const filePath = config.customHelpers[helperName];
      const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

      if (fs.existsSync(resolvedPath)) {
        const requiredFile = require(resolvedPath);

        if (requiredFile && requiredFile && typeof requiredFile === 'function') {
          resolvedHelpers[helperName] = requiredFile;
        } else {
          throw new Error(`Custom template file ${resolvedPath} does not have a default export function!`);
        }
      } else {
        throw new Error(`Custom template file ${helperName} does not exists in path: ${resolvedPath}`);
      }
    });

    templateConfig = {
      inputType: EInputType.PROJECT,
      templates,
      flattenTypes: config.flattenTypes,
      primitives: config.primitives,
      customHelpers: resolvedHelpers
    };
  }

  const relevantEnvVars = Object.keys(process.env)
    .filter(name => name.startsWith('CODEGEN_'))
    .reduce((prev, name) => {
      const cleanName = name
        .replace('CODEGEN_', '')
        .toLowerCase()
        .replace(/[-_]+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .replace(/ (.)/g, res => res.toUpperCase())
        .replace(/ /g, '');
      let value: any = process.env[name];

      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }

      prev[cleanName] = value;

      return prev;
    }, {});

  if (isGeneratorConfig(templateConfig)) {
    templateConfig.config = {
      ...(config && config.generatorConfig ? config.generatorConfig || {} : {}),
      ...(relevantEnvVars || {})
    };

    if (templateConfig.deprecationNote) {
      logger.warn(`Template ${template} is deprecated: ${templateConfig.deprecationNote}`);
    }
  }

  return (await compileTemplate(templateConfig, context, [transformedDocuments], {
    generateSchema,
    generateDocuments
  })).map((item: FileOutput) => {
    let resultName = item.filename;

    if (!path.isAbsolute(resultName)) {
      const resolved = path.resolve(process.cwd(), out);

      if (fs.existsSync(resolved)) {
        const stats = fs.lstatSync(resolved);

        if (stats.isDirectory()) {
          resultName = path.resolve(resolved, item.filename);
        } else if (stats.isFile()) {
          resultName = resolved;
        }
      } else {
        if (out.endsWith('/')) {
          resultName = path.resolve(resolved, item.filename);
        } else {
          resultName = resolved;
        }
      }
    }

    const resultDir = path.dirname(resultName);
    mkdirp.sync(resultDir);

    return {
      content: item.content,
      filename: resultName
    };
  });
};
