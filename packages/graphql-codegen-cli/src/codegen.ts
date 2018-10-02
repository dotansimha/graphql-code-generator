import * as commander from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import { DocumentNode, extendSchema, GraphQLSchema, parse } from 'graphql';

import { documentsFromGlobs } from './utils/documents-glob';
import { LoadDocumentError, loadDocumentsSources } from './loaders/documents/document-loader';
import { scanForTemplatesInPath } from './loaders/template/templates-scanner';
import { ALLOWED_CUSTOM_TEMPLATE_EXT, compileTemplate } from 'graphql-codegen-compiler';
import {
  CustomProcessingFunction,
  debugLog,
  EInputType,
  FileOutput,
  GeneratorConfig,
  getLogger,
  isGeneratorConfig,
  schemaToTemplateContext,
  setSilentLogger,
  transformDocument,
  useWinstonLogger
} from 'graphql-codegen-core';
import { IntrospectionFromFileLoader } from './loaders/schema/introspection-from-file';
import { IntrospectionFromUrlLoader } from './loaders/schema/introspection-from-url';
import { SchemaFromTypedefs } from './loaders/schema/schema-from-typedefs';
import { SchemaFromExport } from './loaders/schema/schema-from-export';
import { CLIOptions } from './cli-options';
import { mergeGraphQLSchemas } from '@graphql-modules/epoxy';
import { makeExecutableSchema } from 'graphql-tools';
import { SchemaTemplateContext } from 'graphql-codegen-core/dist/types';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

export const cliError = (err: any) => {
  let msg: string;

  if (err instanceof Error) {
    msg = err.message || err.toString();
  } else if (typeof err === 'string') {
    msg = err;
  } else {
    msg = JSON.stringify(err);
  }

  getLogger().error(msg);
  process.exit(1);

  return;
};

export const validateCliOptions = (options: CLIOptions) => {
  if (options.silent) {
    setSilentLogger();
  } else {
    useWinstonLogger();
  }

  const schema = options.schema;
  const template = options.template;
  const project = options.project;

  if (!schema) {
    cliError('Flag --schema is missing!');
  }

  if (!template && !project) {
    cliError(
      'Please specify language/platform, using --template flag, or specify --project to generate with custom project!'
    );
  }
};

const schemaHandlers = [
  new IntrospectionFromUrlLoader(),
  new IntrospectionFromFileLoader(),
  new SchemaFromTypedefs(),
  new SchemaFromExport()
];

export const executeWithOptions = async (options: CLIOptions): Promise<FileOutput[]> => {
  validateCliOptions(options);

  const schema = options.schema;
  const clientSchema = options.clientSchema;
  const documents: string[] = options.args || [];
  let template = options.template;
  const project = options.project;
  const gqlGenConfigFilePath = options.config || './gql-gen.json';
  const out = options.out || './';
  const generateSchema: boolean = !options.skipSchema;
  const generateDocuments: boolean = !options.skipDocuments;
  const modulesToRequire: string[] = options.require || [];

  modulesToRequire.forEach(mod => require(mod));

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
      getLogger().warn(
        `You are using the old template name, please install it from NPM and use it by it's new name: "graphql-codegen-typescript-template"`
      );
      template = 'graphql-codegen-typescript-template';
    } else if (template === 'ts-multiple' || template === 'typescript-multiple') {
      getLogger().warn(
        `You are using the old template name, please install it from NPM and use it by it's new name: "graphql-codegen-typescript-template-multiple"`
      );
      template = 'graphql-codegen-typescript-template-multiple';
    }

    const localFilePath = path.resolve(process.cwd(), template);
    const localFileExists = fs.existsSync(localFilePath);

    try {
      const templateFromExport = require(localFileExists ? localFilePath : template);

      if (!templateFromExport) {
        throw new Error();
      }

      templateConfig = templateFromExport.default || templateFromExport.config || templateFromExport;
    } catch (e) {
      throw new Error(`Unknown codegen template: "${template}", please make sure it's installed using npm/Yarn!`);
    }
  }

  debugLog(`[executeWithOptions] using project: ${project}`);

  const configPath = path.resolve(process.cwd(), gqlGenConfigFilePath);
  let config: GqlGenConfig = null;

  if (fs.existsSync(configPath)) {
    getLogger().info('Loading config file from: ', configPath);
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
    .reduce(
      (prev, name) => {
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
      },
      {} as GeneratorConfig['config']
    );

  let addToSchema: DocumentNode[] = [];

  if (isGeneratorConfig(templateConfig)) {
    templateConfig.config = {
      ...(config && config.generatorConfig ? config.generatorConfig || {} : {}),
      ...(relevantEnvVars || {})
    };

    if (templateConfig.deprecationNote) {
      getLogger().warn(`Template ${template} is deprecated: ${templateConfig.deprecationNote}`);
    }

    if (templateConfig.addToSchema) {
      const asArray = Array.isArray(templateConfig.addToSchema)
        ? templateConfig.addToSchema
        : [templateConfig.addToSchema];
      addToSchema = asArray.map(
        (extension: string | DocumentNode) => (typeof extension === 'string' ? parse(extension) : extension)
      );
    }

    if (config) {
      if ('flattenTypes' in config) {
        templateConfig.flattenTypes = config.flattenTypes;
      }

      if ('primitives' in config) {
        templateConfig.primitives = {
          ...templateConfig.primitives,
          ...config.primitives
        };
      }
    }
  }

  const executeGeneration = async () => {
    const loadSchema = async (pointToSchema: string) => {
      for (const handler of schemaHandlers) {
        if (await handler.canHandle(pointToSchema)) {
          return handler.handle(pointToSchema, options);
        }
      }

      throw new Error('Could not handle schema');
    };

    const schemas: (GraphQLSchema | Promise<GraphQLSchema>)[] = [];

    try {
      debugLog(`[executeWithOptions] Schema is being loaded `);
      schemas.push(loadSchema(schema));
    } catch (e) {
      debugLog(`[executeWithOptions] Failed to load schema`, e);
      cliError('Invalid --schema provided, please use a path to local file, HTTP endpoint or a glob expression!');
    }

    if (clientSchema) {
      try {
        debugLog(`[executeWithOptions] Client Schema is being loaded `);
        schemas.push(loadSchema(clientSchema));
      } catch (e) {
        debugLog(`[executeWithOptions] Failed to load client schema`, e);
        cliError('Invalid --clientSchema provided, please use a path to local file or a glob expression!');
      }
    }

    const allSchemas = await Promise.all(schemas);

    let graphQlSchema =
      allSchemas.length === 1
        ? allSchemas[0]
        : makeExecutableSchema({ typeDefs: mergeGraphQLSchemas(allSchemas), allowUndefinedInResolve: true });

    if (addToSchema && addToSchema.length > 0) {
      for (const extension of addToSchema) {
        debugLog(`Extending GraphQL Schema with: `, extension);
        graphQlSchema = extendSchema(graphQlSchema, extension);
      }
    }

    if (process.env.VERBOSE !== undefined) {
      getLogger().info(`GraphQL Schema is: `, graphQlSchema);
    }

    const context = schemaToTemplateContext(graphQlSchema);
    debugLog(`[executeWithOptions] Schema template context build, the result is: `);
    Object.keys(context).forEach((key: keyof SchemaTemplateContext) => {
      if (Array.isArray(context[key])) {
        debugLog(`Total of ${key}: ${(context[key] as any[]).length}`);
      }
    });

    const documentSourcesResult = loadDocumentsSources(graphQlSchema, await documentsFromGlobs(documents));

    if (Array.isArray(documentSourcesResult) && documentSourcesResult.length > 0) {
      let errorCount = 0;
      const loadDocumentErrors = documentSourcesResult as ReadonlyArray<LoadDocumentError>;

      for (const loadDocumentError of loadDocumentErrors) {
        for (const graphQLError of loadDocumentError.errors) {
          getLogger().error(`[${loadDocumentError.filePath}] GraphQL Error: ${graphQLError.message}`);
          errorCount++;
        }
      }

      cliError(`Found ${errorCount} errors when validating your GraphQL documents against schema!`);
    }

    const transformedDocuments = transformDocument(graphQlSchema, documentSourcesResult as DocumentNode);

    return compileTemplate(templateConfig, context, [transformedDocuments], {
      generateSchema,
      generateDocuments
    });
  };

  const normalizeOutput = (item: FileOutput) => {
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
  };
  return (await executeGeneration()).map(normalizeOutput);
};
