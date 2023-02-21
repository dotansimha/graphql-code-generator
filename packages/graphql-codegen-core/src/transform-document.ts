import { createNoopProfiler, Types } from '@graphql-codegen/plugin-helpers';

export async function transformDocuments(options: Types.GenerateOptions): Promise<Types.DocumentFile[]> {
  const documentTransforms = options.documentTransforms || [];
  let documents = options.documents;
  if (documentTransforms.length === 0 || options.documents.length === 0) {
    return documents;
  }

  const profiler = options.profiler ?? createNoopProfiler();

  for (const documentTransform of documentTransforms) {
    const config =
      typeof documentTransform.config === 'object'
        ? {
            ...options.config,
            ...documentTransform.config,
          }
        : {};
    const { transform } = documentTransform.transformObject;
    if (transform && typeof transform === 'function') {
      const name = documentTransform.name;
      try {
        await profiler.run(async () => {
          documents = await transform({
            documents,
            schema: options.schema,
            config,
            pluginContext: options.pluginContext,
          });
        }, `DocumentTransform "${name}" execution`);
      } catch (e) {
        throw new Error(
          `DocumentTransform "${name}" failed: \n
            ${e.message}
          `
        );
      }
    } else {
      throw new Error(`Missing 'transform' function in "${documentTransform.name}"`);
    }
  }

  return documents;
}
