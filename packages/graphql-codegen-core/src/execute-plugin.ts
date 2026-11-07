import { buildASTSchema, DocumentNode, GraphQLSchema } from 'graphql';
import {
  CodegenPlugin,
  createNoopProfiler,
  PluginInfo,
  Profiler,
  Types,
} from '@graphql-codegen/plugin-helpers';

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

export async function executePlugin(
  options: ExecutePluginOptions,
  plugin: CodegenPlugin,
): Promise<Types.PluginOutput> {
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
        `,
    );
  }

  const outputSchema: GraphQLSchema =
    options.schemaAst || buildASTSchema(options.schema, options.config as any);
  const documents = options.documents || [];
  const profiler = options.profiler ?? createNoopProfiler();
  const info: PluginInfo = {
    outputFile: options.outputFilename,
    allPlugins: options.allPlugins,
    pluginContext: options.pluginContext || {},
  };

  const validate = plugin.validate;
  if (validate && typeof validate === 'function') {
    try {
      await profiler.run(
        async () => validate(outputSchema, documents, options.config, info),
        `Plugin ${options.name} validate`,
      );
    } catch (e) {
      throw new Error(
        `Plugin "${options.name}" validation failed: \n
            ${e instanceof Error ? e.message : String(e)}
          `,
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
          info,
        ),
      ),
    `Plugin ${options.name} execution`,
  );
}
