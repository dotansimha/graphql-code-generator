import { Types, CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import { DocumentNode, GraphQLSchema, buildASTSchema, Kind } from 'graphql';
import { DetailedError } from './errors';
import { validateGraphQlDocuments, checkValidationErrors } from 'graphql-toolkit';

export interface ExecutePluginOptions {
  name: string;
  config: Types.PluginConfig;
  parentConfig: Types.PluginConfig;
  schema: DocumentNode;
  schemaAst?: GraphQLSchema;
  documents: Types.DocumentFile[];
  outputFilename: string;
  allPlugins: Types.ConfiguredPlugin[];
  skipDocumentsValidation?: boolean;
}

export async function executePlugin(options: ExecutePluginOptions, plugin: CodegenPlugin): Promise<Types.PluginOutput> {
  if (!plugin || !plugin.plugin || typeof plugin.plugin !== 'function') {
    throw new DetailedError(
      `Invalid Custom Plugin "${options.name}"`,
      `
        Plugin ${options.name} does not export a valid JS object with "plugin" function.
  
        Make sure your custom plugin is written in the following form:
  
        module.exports = {
          plugin: (schema, documents, config) => {
            return 'my-custom-plugin-content';
          },
        };
        `
    );
  }

  const skipDocumentValidation = typeof options.config === 'object' && !Array.isArray(options.config) && options.config.skipDocumentsValidation;

  const schema = options.schemaAst;

  const outputSchema: GraphQLSchema = schema || buildASTSchema(options.schema);
  const documents = options.documents || [];

  if (outputSchema && documents.length > 0 && !skipDocumentValidation) {
    const configObject = typeof options.config === 'object' ? options.config : options.parentConfig;
    const extraFragments = configObject && (configObject as any)['externalFragments'] ? (configObject as any)['externalFragments'] : [];
    const errors = await validateGraphQlDocuments(outputSchema, [...documents, ...extraFragments.map((f: any) => ({ filePath: f.importFrom, content: { kind: Kind.DOCUMENT, definitions: [f.node] } }))]);
    checkValidationErrors(errors);
  }

  if (plugin.validate && typeof plugin.validate === 'function') {
    try {
      await plugin.validate(outputSchema, documents, options.config, options.outputFilename, options.allPlugins);
    } catch (e) {
      throw new DetailedError(
        `Plugin "${options.name}" validation failed:`,
        `
            ${e.message}
          `
      );
    }
  }

  return await Promise.resolve(
    plugin.plugin(outputSchema, documents, typeof options.config === 'object' ? { ...options.config } : options.config, {
      outputFile: options.outputFilename,
      allPlugins: options.allPlugins,
    })
  );
}
