import { Types, DocumentFile, CodegenPlugin } from 'graphql-codegen-core';
import { DocumentNode, GraphQLSchema } from 'graphql';
import { resolve } from 'path';
import { DetailedError } from './errors';
import { buildSchema } from './merge-schemas';
import { validateGraphQlDocuments, checkValidationErrors } from './loaders/documents/validate-documents';

export interface ExecutePluginOptions {
  name: string;
  config: Types.PluginConfig;
  schema: DocumentNode;
  documents: DocumentFile[];
  outputFilename: string;
  allPlugins: Types.ConfiguredPlugin[];
}

export async function getPluginByName(name: string, pluginLoader: Types.PluginLoaderFn): Promise<CodegenPlugin> {
  const possibleNames = [
    `graphql-codegen-${name}`,
    `graphql-codegen-${name}-template`,
    `codegen-${name}`,
    `codegen-${name}-template`,
    name
  ];
  const possibleModules = possibleNames.concat(resolve(process.cwd(), name));

  for (const moduleName of possibleModules) {
    try {
      return pluginLoader(moduleName) as CodegenPlugin;
    } catch (err) {
      if (err.message.indexOf(`Cannot find module '${moduleName}'`) === -1) {
        throw new DetailedError(
          `Unable to load template plugin matching ${name}`,
          `
              Unable to load template plugin matching '${name}'.
              Reason: 
                ${err.message}
            `
        );
      }
    }
  }

  const possibleNamesMsg = possibleNames
    .map(name =>
      `
        - ${name}
    `.trimRight()
    )
    .join('');

  throw new DetailedError(
    `Unable to find template plugin matching ${name}`,
    `
        Unable to find template plugin matching '${name}'
        Install one of the following packages:
        
        ${possibleNamesMsg}
      `
  );
}

export async function executePlugin(options: ExecutePluginOptions, pluginPackage: CodegenPlugin): Promise<string> {
  if (!pluginPackage || !pluginPackage.plugin || typeof pluginPackage.plugin !== 'function') {
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

  const outputSchema: GraphQLSchema = buildSchema(options.schema);

  if (outputSchema && options.documents.length > 0) {
    const errors = validateGraphQlDocuments(outputSchema, options.documents);
    checkValidationErrors(errors);
  }

  if (pluginPackage.validate && typeof pluginPackage.validate === 'function') {
    try {
      await pluginPackage.validate(
        outputSchema,
        options.documents,
        options.config,
        options.outputFilename,
        options.allPlugins
      );
    } catch (e) {
      throw new DetailedError(
        `Plugin "${options.name}" validation failed:`,
        `
            ${e.message}
          `
      );
    }
  }

  return pluginPackage.plugin(outputSchema, options.documents, options.config);
}
