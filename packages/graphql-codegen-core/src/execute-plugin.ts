import { CodegenPlugin, createNoopProfiler, Profiler, Types } from '@graphql-codegen/plugin-helpers';
import { buildASTSchema, DocumentNode, GraphQLSchema } from 'graphql';

export interface ExecutePluginOptions {
  name: string;
  config: Types.PluginConfig;
  parentConfig: Types.PluginConfig;
  schema: DocumentNode;
  schemaAst?: GraphQLSchema;
  documents: Types.DocumentFile[];
  outputFilename: string;
  allPlugins: Types.ConfiguredPlugin[];
  skipDocumentsValidation?: Types.SkipDocumentsValidationOptions;
  pluginContext?: { [key: string]: any };
  profiler?: Profiler;
}

export async function executePlugin(options: ExecutePluginOptions, plugin: CodegenPlugin): Promise<Types.PluginOutput> {
  if (!plugin?.plugin || typeof plugin.plugin !== 'function') {
    throw new Error(
      `Invalid Custom Plugin "${options.name}" \n
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

  const outputSchema: GraphQLSchema = options.schemaAst || buildASTSchema(options.schema, options.config as any);
  const documents = options.documents || [];
  const pluginContext = options.pluginContext || {};
  const profiler = options.profiler ?? createNoopProfiler();

  if (plugin.validate && typeof plugin.validate === 'function') {
    try {
      // FIXME: Sync validate signature with plugin signature
      await profiler.run(
        async () =>
          plugin.validate(
            outputSchema,
            documents,
            options.config,
            options.outputFilename,
            options.allPlugins,
            pluginContext
          ),
        `Plugin ${options.name} validate`
      );
    } catch (e) {
      throw new Error(
        `Plugin "${options.name}" validation failed: \n
            ${e.message}
          `
      );
    }
  }

  return profiler.run(
    () =>
      Promise.resolve(
        plugin.plugin(
          outputSchema,
          documents,
          typeof options.config === 'object' ? { ...options.config } : options.config,
          {
            outputFile: options.outputFilename,
            allPlugins: options.allPlugins,
            pluginContext,
          }
        )
      ),
    `Plugin ${options.name} execution`
  );
}
