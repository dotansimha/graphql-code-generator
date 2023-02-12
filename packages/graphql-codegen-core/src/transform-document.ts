import { createNoopProfiler, Types } from '@graphql-codegen/plugin-helpers';
import { buildASTSchema, GraphQLSchema } from 'graphql';

export async function transformDocuments(options: Types.GenerateOptions): Promise<Types.DocumentFile[]> {
  const documentTransforms = options.documentTransforms || [];
  let documents = options.documents;
  if (documentTransforms.length === 0) {
    return documents;
  }

  const profiler = options.profiler ?? createNoopProfiler();
  const outputSchema: GraphQLSchema = options.schemaAst || buildASTSchema(options.schema, options.config as any);

  for (const documentTransform of documentTransforms) {
    const name = Object.keys(documentTransform)[0];
    const transformPlugin = documentTransform[name].plugin;
    const pluginConfig = documentTransform[name].config;

    const config =
      typeof pluginConfig === 'object'
        ? {
            ...options.config,
            ...pluginConfig,
          }
        : pluginConfig;

    if (transformPlugin.transformDocuments && typeof transformPlugin.transformDocuments === 'function') {
      try {
        await profiler.run(async () => {
          documents = await transformPlugin.transformDocuments(outputSchema, documents, config, {
            outputFile: options.filename,
            allPlugins: options.plugins,
            pluginContext: options.pluginContext,
          });
        }, `Document transform ${name} execution`);
      } catch (e) {
        throw new Error(
          `Document transform "${name}" failed: \n
            ${e.message}
          `
        );
      }
    }
  }

  return documents;
}
