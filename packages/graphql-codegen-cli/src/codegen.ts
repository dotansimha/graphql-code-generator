import { FileOutput, GraphQLSchema, DocumentFile, Types, CodegenPlugin } from 'graphql-codegen-core';
import { mergeSchemas as remoteMergeSchemas, makeExecutableSchema } from 'graphql-tools';
import * as Listr from 'listr';
import { normalizeOutputParam, normalizeInstanceOrArray, normalizeConfig } from './helpers';
import { IntrospectionFromUrlLoader } from './loaders/schema/introspection-from-url';
import { IntrospectionFromFileLoader } from './loaders/schema/introspection-from-file';
import { SchemaFromTypedefs } from './loaders/schema/schema-from-typedefs';
import { SchemaFromExport } from './loaders/schema/schema-from-export';
import { documentsFromGlobs } from './utils/documents-glob';
import { loadDocumentsSources } from './loaders/documents/document-loader';
import { validateGraphQlDocuments, checkValidationErrors } from './loaders/documents/validate-documents';
import { prettify } from './utils/prettier';
import { cliError } from './utils/cli-error';
import { Renderer } from './utils/listr-renderer';

export interface GenerateOutputOptions {
  filename: string;
  plugins: Types.ConfiguredPlugin[];
  schema: GraphQLSchema;
  documents: DocumentFile[];
  inheritedConfig: { [key: string]: any };
}

export interface ExecutePluginOptions {
  name: string;
  config: Types.PluginConfig;
  schema: GraphQLSchema;
  documents: DocumentFile[];
  outputFilename: string;
  allPlugins: Types.ConfiguredPlugin[];
}

const schemaHandlers = [
  new IntrospectionFromUrlLoader(),
  new IntrospectionFromFileLoader(),
  new SchemaFromTypedefs(),
  new SchemaFromExport()
];

const loadSchema = async (schemaDef: Types.Schema, config: Types.Config): Promise<GraphQLSchema> => {
  for (const handler of schemaHandlers) {
    let pointToSchema: string = null;
    let options: any = {};

    if (typeof schemaDef === 'string') {
      pointToSchema = schemaDef as string;
    } else if (typeof schemaDef === 'object') {
      pointToSchema = Object.keys(schemaDef)[0];
      options = schemaDef[pointToSchema];
    }

    if (await handler.canHandle(pointToSchema)) {
      return handler.handle(pointToSchema, config, options);
    }
  }

  throw new Error(`Could not handle schema: ${schemaDef}`);
};

async function mergeSchemas(schemas: GraphQLSchema[]): Promise<GraphQLSchema> {
  if (schemas.length === 0) {
    return null;
  } else if (schemas.length === 1) {
    return schemas[0];
  } else {
    return remoteMergeSchemas({ schemas: schemas.filter(s => s) });
  }
}

export async function executeCodegen(config: Types.Config): Promise<FileOutput[]> {
  const result: FileOutput[] = [];
  const commonListrOptions = {
    exitOnError: true
  };
  const verboseOptions = {
    ...commonListrOptions,
    renderer: 'verbose',
    nonTTYRenderer: 'verbose'
  };
  const listrOptions: any = {
    ...commonListrOptions,
    renderer: Renderer,
    collapse: true,
    clearOutput: false
  };
  const listr = new Listr(process.env.VERBOSE || process.env.NODE_ENV === 'test' ? verboseOptions : listrOptions);

  let rootConfig: {
    [key: string]: any;
  } = {};
  let schemas: Types.Schema[];
  let documents: Types.OperationDocument[];
  let generates: { [filename: string]: Types.ConfiguredOutput } = {};
  let rootSchema: GraphQLSchema;
  let rootDocuments: DocumentFile[] = [];

  function normalize() {
    /* Load Require extensions */
    const requireExtensions = normalizeInstanceOrArray<string>(config.require);
    requireExtensions.forEach(mod => require(mod));

    /* Root templates-config */
    rootConfig = config.config || {};

    /* Normalize root "schema" field */
    schemas = normalizeInstanceOrArray<Types.Schema>(config.schema);

    /* Normalize root "documents" field */
    documents = normalizeInstanceOrArray<Types.OperationDocument>(config.documents);

    /* Normalize "generators" field */
    for (const filename of Object.keys(config.generates)) {
      generates[filename] = normalizeOutputParam(config.generates[filename]);
    }
  }

  async function loadRootSchema() {
    /* Load root schemas */
    rootSchema = await mergeSchemas(await Promise.all(schemas.map(pointToScehma => loadSchema(pointToScehma, config))));
  }

  async function loadRootDocuments() {
    /* Load root documents */
    if (documents.length > 0) {
      const foundDocumentsPaths = await documentsFromGlobs(documents);
      rootDocuments = await loadDocumentsSources(foundDocumentsPaths);

      if (rootSchema) {
        const errors = validateGraphQlDocuments(rootSchema, rootDocuments);
        checkValidationErrors(errors);
      }
    }
  }

  listr.add({
    title: 'Parse configuration',
    task: ctx => {
      normalize();

      ctx.hasSchemas = schemas.length > 0;
      ctx.hasDocuments = documents.length > 0;
    }
  });

  listr.add({
    title: 'Load schema',
    enabled: ctx => ctx.hasSchemas,
    task: loadRootSchema
  });

  listr.add({
    title: 'Load documents',
    enabled: ctx => ctx.hasDocuments,
    task: async () => {
      try {
        await loadRootDocuments();
      } catch (error) {
        if (!config.watch) {
          throw error;
        } else {
          cliError(error, true);
        }
      }
    }
  });

  listr.add({
    title: 'Generate outputs',
    task: () => {
      return new Listr(
        Object.keys(generates).map<Listr.ListrTask>((filename, i) => ({
          title: `Generate ${filename}`,
          task: () => {
            const outputConfig = generates[filename];
            const outputFileTemplateConfig = outputConfig.config || {};
            let outputSchema = rootSchema;
            let outputDocuments: DocumentFile[] = rootDocuments;

            const outputSpecificSchemas = normalizeInstanceOrArray<Types.Schema>(outputConfig.schema);
            const outputSpecificDocuments = normalizeInstanceOrArray<Types.OperationDocument>(outputConfig.documents);

            async function addSchema() {
              outputSchema = await mergeSchemas([
                rootSchema,
                ...(await Promise.all(outputSpecificSchemas.map(pointToScehma => loadSchema(pointToScehma, config))))
              ]);
            }

            async function addDocuments() {
              const foundDocumentsPaths = await documentsFromGlobs(outputSpecificDocuments);
              const additionalDocs = await loadDocumentsSources(foundDocumentsPaths);

              if (outputSchema) {
                const errors = validateGraphQlDocuments(outputSchema, additionalDocs);
                checkValidationErrors(errors);
              }

              outputDocuments = [...rootDocuments, ...additionalDocs];
            }

            async function doGenerateOutput() {
              const normalizedPluginsArray = normalizeConfig(outputConfig.plugins);
              const output = await generateOutput({
                filename,
                plugins: normalizedPluginsArray,
                schema: outputSchema,
                documents: outputDocuments,
                inheritedConfig: {
                  ...rootConfig,
                  ...outputFileTemplateConfig
                }
              });
              result.push(output);
            }

            return new Listr(
              [
                {
                  title: 'Add related schemas',
                  enabled: () => outputSpecificSchemas.length > 0,
                  task: async () => {
                    try {
                      await addSchema();
                    } catch (error) {
                      error.source = filename;
                      throw error;
                    }
                  }
                },
                {
                  title: 'Add related documents',
                  enabled: () => outputSpecificDocuments.length > 0,
                  task: async () => {
                    try {
                      await addDocuments();
                    } catch (error) {
                      if (!config.watch) {
                        error.source = filename;
                        throw error;
                      } else {
                        cliError(error, true);
                      }
                    }
                  }
                },
                {
                  title: 'Generate',
                  task: async () => {
                    try {
                      await doGenerateOutput();
                    } catch (error) {
                      error.source = filename;
                      throw error;
                    }
                  }
                }
              ],
              {
                // it stops when one of tasks failed
                exitOnError: true
              }
            );
          }
        })),
        {
          // it doesn't stop when one of tasks failed, to finish at least some of outputs
          exitOnError: false,
          // run 4 at once
          concurrent: 4
        }
      );
    }
  });

  await listr.run();

  return result;
}

export async function generateOutput(options: GenerateOutputOptions): Promise<FileOutput> {
  let output = '';

  for (const plugin of options.plugins) {
    const name = Object.keys(plugin)[0];
    const pluginConfig = plugin[name];
    const result = await executePlugin({
      name,
      config:
        typeof pluginConfig !== 'object'
          ? pluginConfig
          : {
              ...options.inheritedConfig,
              ...(pluginConfig as object)
            },
      schema: options.schema,
      documents: options.documents,
      outputFilename: options.filename,
      allPlugins: options.plugins
    });

    output += result;
  }

  return { filename: options.filename, content: await prettify(options.filename, output) };
}

export async function getPluginByName(name: string): Promise<CodegenPlugin> {
  const possibleNames = [
    `graphql-codegen-${name}`,
    `graphql-codegen-${name}-template`,
    `codegen-${name}`,
    `codegen-${name}-template`,
    name
  ];

  for (const packageName of possibleNames) {
    try {
      return require(packageName) as CodegenPlugin;
    } catch (e) {}
  }

  throw new Error(`Unable to find template plugin matching ${name}!`);
}

export async function executePlugin(options: ExecutePluginOptions): Promise<string> {
  const pluginPackage = await getPluginByName(options.name);

  const schema = !pluginPackage.addToSchema
    ? options.schema
    : await mergeSchemas([
        options.schema,
        makeExecutableSchema({
          typeDefs: pluginPackage.addToSchema,
          allowUndefinedInResolve: true,
          resolverValidationOptions: {
            requireResolversForResolveType: false,
            requireResolversForAllFields: false,
            requireResolversForNonScalar: false,
            requireResolversForArgs: false
          }
        })
      ]);

  if (pluginPackage.validate && typeof pluginPackage.validate === 'function') {
    try {
      await pluginPackage.validate(
        schema,
        options.documents,
        options.config,
        options.outputFilename,
        options.allPlugins
      );
    } catch (e) {}
  }

  return pluginPackage.plugin(schema, options.documents, options.config);
}
