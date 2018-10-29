import { FileOutput, GraphQLSchema, DocumentFile, Types, PluginFunction } from 'graphql-codegen-core';
import { mergeSchemas as remoteMergeSchemas } from 'graphql-tools';
import { normalizeOutputParam, normalizeInstanceOrArray, normalizeConfig } from './helpers';
import { IntrospectionFromUrlLoader } from './loaders/schema/introspection-from-url';
import { IntrospectionFromFileLoader } from './loaders/schema/introspection-from-file';
import { SchemaFromTypedefs } from './loaders/schema/schema-from-typedefs';
import { SchemaFromExport } from './loaders/schema/schema-from-export';
import { documentsFromGlobs } from './utils/documents-glob';
import { loadDocumentsSources } from './loaders/documents/document-loader';
import { validateGraphQlDocuments } from './loaders/documents/validate-documents';

export interface GenerateOutputOptions {
  filename: string;
  plugins: Types.ConfiguredPlugin[];
  schema: GraphQLSchema;
  documents: DocumentFile[];
}

export interface ExecutePluginOptions {
  name: string;
  config: Types.PluginConfig;
  schema: GraphQLSchema;
  documents: DocumentFile[];
}

const schemaHandlers = [
  new IntrospectionFromUrlLoader(),
  new IntrospectionFromFileLoader(),
  new SchemaFromTypedefs(),
  new SchemaFromExport()
];

const loadSchema = async (schemaDef: Types.Schema): Promise<GraphQLSchema> => {
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
      return handler.handle(pointToSchema, options);
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
    return remoteMergeSchemas({ schemas });
  }
}

export async function generate(config: Types.Config): Promise<FileOutput[]> {
  const result = [];

  /* Normalize root "schema" field */
  const schemas = normalizeInstanceOrArray<Types.Schema>(config.schema);

  /* Normalize root "documents" field */
  const documents = normalizeInstanceOrArray<Types.OperationDocument>(config.documents);

  /* Normalize "generators" field */
  let generates: { [filename: string]: Types.ConfiguredOutput } = {};
  for (const filename of Object.keys(config.generates)) {
    generates[filename] = normalizeOutputParam(config.generates[filename]);
  }

  /* Load root schemas */
  const rootSchema = await mergeSchemas(await Promise.all(schemas.map(loadSchema)));

  /* Load root documents */
  let rootDocuments: DocumentFile[] = [];

  if (documents.length > 0) {
    const foundDocumentsPaths = await documentsFromGlobs(documents);
    rootDocuments = await loadDocumentsSources(foundDocumentsPaths);
    validateGraphQlDocuments(rootSchema, rootDocuments);
  }

  /* Iterate through all output files, and execute each template piece */
  for (let filename of Object.keys(generates)) {
    const outputConfig = generates[filename];
    let outputSchema = rootSchema;
    let outputDocuments: DocumentFile[] = rootDocuments;

    const outputSpecificSchemas = normalizeInstanceOrArray<Types.Schema>(outputConfig.schema);
    if (outputSpecificSchemas.length > 0) {
      outputSchema = await mergeSchemas([rootSchema, ...(await Promise.all(outputSpecificSchemas.map(loadSchema)))]);
    }

    const outputSpecificDocuments = normalizeInstanceOrArray<Types.OperationDocument>(outputConfig.documents);

    if (outputSpecificDocuments.length > 0) {
      const foundDocumentsPaths = await documentsFromGlobs(outputSpecificDocuments);
      const additionalDocs = await loadDocumentsSources(foundDocumentsPaths);
      validateGraphQlDocuments(outputSchema, additionalDocs);

      outputDocuments = [...rootDocuments, ...additionalDocs];
    }

    const normalizedPluginsArray = normalizeConfig(outputConfig.plugins);
    const output = await generateOutput({
      filename,
      plugins: normalizedPluginsArray,
      schema: outputSchema,
      documents: outputDocuments
    });
    result.push(output);
  }

  return result;
}

export async function generateOutput(options: GenerateOutputOptions): Promise<FileOutput> {
  let output = '';

  for (const plugin of options.plugins) {
    const name = Object.keys(plugin)[0];
    const pluginConfig = plugin[name];
    const result = await executePlugin({
      name,
      config: pluginConfig,
      schema: options.schema,
      documents: options.documents
    });

    output += result;
  }

  return { filename: options.filename, content: output };
}

export async function getPluginByName(name: string): Promise<{ plugin: PluginFunction }> {
  const possibleNames = [
    `graphql-codegen-${name}`,
    `graphql-codegen-${name}-template`,
    `codegen-${name}`,
    `codegen-${name}-template`,
    name
  ];

  for (const packageName of possibleNames) {
    try {
      return require(packageName) as { plugin: PluginFunction };
    } catch (e) {}
  }

  throw new Error(`Unable to find template plugin matching ${name}!`);
}

export async function executePlugin(options: ExecutePluginOptions): Promise<string> {
  const pluginPackage = await getPluginByName(options.name);

  return pluginPackage.plugin(options.schema, options.documents, options.config);
}
