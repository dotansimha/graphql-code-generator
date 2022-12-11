import { createNoopProfiler, Types } from '@graphql-codegen/plugin-helpers';
import { buildASTSchema, GraphQLSchema } from 'graphql';

export async function transformDocuments(options: Types.GenerateOptions): Promise<Types.DocumentFile[]> {
  const documentTransformPlugins = options.documentTransformPlugins || [];
  let documents = options.documents;
  if (documentTransformPlugins.length === 0) {
    return documents;
  }

  const profiler = options.profiler ?? createNoopProfiler();
  const outputSchema: GraphQLSchema = options.schemaAst || buildASTSchema(options.schema, options.config as any);

  for (const documentTransformPlugin of documentTransformPlugins) {
    const name = Object.keys(documentTransformPlugin)[0];
    const transformPlugin = documentTransformPlugin[name].plugin;
    const pluginConfig = documentTransformPlugin[name].config;

    const config =
      typeof pluginConfig !== 'object'
        ? pluginConfig
        : {
            ...options.config,
            ...pluginConfig,
          };

    if (
      transformPlugin.validateBeforeTransformDocuments &&
      typeof transformPlugin.validateBeforeTransformDocuments === 'function'
    ) {
      try {
        await profiler.run(
          async () =>
            transformPlugin.validateBeforeTransformDocuments(
              outputSchema,
              options.documents,
              config,
              options.filename,
              options.plugins,
              options.pluginContext
            ),
          `Document transform ${name} validate`
        );
      } catch (e) {
        throw new Error(
          `Document transform "${name}" validation failed: \n
            ${e.message}
          `
        );
      }
    }

    if (transformPlugin.transformDocuments && typeof transformPlugin.transformDocuments === 'function') {
      await profiler.run(async () => {
        documents = await transformPlugin.transformDocuments(outputSchema, documents, config, {
          outputFile: options.filename,
          allPlugins: options.plugins,
          pluginContext: options.pluginContext,
        });
      }, `Document transform ${name} execution`);
    }
  }

  return documents;
}
