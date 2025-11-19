import fs from 'fs';
import { createRequire } from 'module';
import { cpus } from 'os';
import path from 'path';
import { codegen } from '@graphql-codegen/core';
import {
  CodegenPlugin,
  getCachedDocumentNodeFromSchema,
  normalizeConfig,
  normalizeImportExtension,
  normalizeInstanceOrArray,
  normalizeOutputParam,
  Types,
} from '@graphql-codegen/plugin-helpers';
import { NoTypeDefinitionsFound } from '@graphql-tools/load';
import { DocumentNode, GraphQLError, GraphQLSchema } from 'graphql';
import { Listr, ListrTask } from 'listr2';
import { CodegenContext, ensureContext } from './config.js';
import { getPluginByName } from './plugins.js';
import { getPresetByName } from './presets.js';
import { debugLog, printLogs } from './utils/debugging.js';
import { getDocumentTransform } from './documentTransforms.js';

/**
 * Poor mans ESM detection.
 * Looking at this and you have a better method?
 * Send a PR.
 */
const isESMModule = (typeof __dirname === 'string') === false;

const makeDefaultLoader = (from: string) => {
  if (fs.statSync(from).isDirectory()) {
    from = path.join(from, '__fake.js');
  }

  const relativeRequire = createRequire(from);

  return async (mod: string) => {
    return import(
      isESMModule
        ? /**
           * For ESM we currently have no "resolve path" solution
           * as import.meta is unavailable in a CommonJS context
           * and furthermore unavailable in stable Node.js.
           **/
          mod
        : relativeRequire.resolve(mod)
    );
  };
};

type Ctx = { errors: Error[] };

function createCache(): <T>(namespace: string, key: string, factory: () => Promise<T>) => Promise<T> {
  const cache = new Map<string, Promise<unknown>>();

  return function ensure<T>(namespace: string, key: string, factory: () => Promise<T>): Promise<T> {
    const cacheKey = `${namespace}:${key}`;

    const cachedValue = cache.get(cacheKey);

    if (cachedValue) {
      return cachedValue as Promise<T>;
    }

    const value = factory();
    cache.set(cacheKey, value);

    return value;
  };
}

export async function executeCodegen(
  input: CodegenContext | Types.Config
): Promise<{ result: Types.FileOutput[]; error: Error | null }> {
  const context = ensureContext(input);
  const config = context.getConfig();
  const pluginContext = context.getPluginContext();
  const result: Types.FileOutput[] = [];

  let rootConfig: { [key: string]: any } = {};
  let rootSchemas: Types.Schema[];
  let rootDocuments: Types.OperationDocument[];
  const generates: { [filename: string]: Types.ConfiguredOutput } = {};

  const cache = createCache();

  function wrapTask(task: () => void | Promise<void>, source: string, taskName: string, ctx: Ctx) {
    return () =>
      context.profiler.run(async () => {
        try {
          await Promise.resolve().then(() => task());
        } catch (error) {
          if (source && !(error instanceof GraphQLError)) {
            error.source = source;
          }
          ctx.errors.push(error);

          throw error;
        }
      }, taskName);
  }

  async function normalize() {
    /* Load Require extensions */
    const requireExtensions = normalizeInstanceOrArray<string>(config.require);
    const loader = makeDefaultLoader(context.cwd);
    for (const mod of requireExtensions) {
      await loader(mod);
    }

    /* Root plugin  config */
    rootConfig = config.config || {};

    /* Normalize root "schema" field */
    rootSchemas = normalizeInstanceOrArray<Types.Schema>(config.schema);

    /* Normalize root "documents" field */
    rootDocuments = normalizeInstanceOrArray<Types.OperationDocument>(config.documents);

    /* Normalize "generators" field */
    const generateKeys = Object.keys(config.generates || {});

    if (generateKeys.length === 0) {
      throw new Error(
        `Invalid Codegen Configuration! \n
        Please make sure that your codegen config file contains the "generates" field, with a specification for the plugins you need.

        It should looks like that:

        schema:
          - my-schema.graphql
        generates:
          my-file.ts:
            - plugin1
            - plugin2
            - plugin3`
      );
    }

    for (const filename of generateKeys) {
      const output = (generates[filename] = normalizeOutputParam(config.generates[filename]));

      if (!output.preset && (!output.plugins || output.plugins.length === 0)) {
        throw new Error(
          `Invalid Codegen Configuration! \n
          Please make sure that your codegen config file has defined plugins list for output "${filename}".

          It should looks like that:

          schema:
            - my-schema.graphql
          generates:
            my-file.ts:
              - plugin1
              - plugin2
              - plugin3
          `
        );
      }
    }

    if (
      rootSchemas.length === 0 &&
      Object.keys(generates).some(
        filename =>
          !generates[filename].schema ||
          (Array.isArray(generates[filename].schema === 'object') &&
            (generates[filename].schema as unknown as any[]).length === 0)
      )
    ) {
      throw new Error(
        `Invalid Codegen Configuration! \n
        Please make sure that your codegen config file contains either the "schema" field
        or every generated file has its own "schema" field.

        It should looks like that:
        schema:
          - my-schema.graphql

        or:
        generates:
          path/to/output:
            schema: my-schema.graphql
      `
      );
    }
  }

  const isTest = process.env.NODE_ENV === 'test';

  const tasks = new Listr<Ctx, 'default' | 'verbose'>(
    [
      {
        title: 'Parse Configuration',
        task: () => normalize(),
      },
      {
        title: 'Generate outputs',
        task: (ctx, task) => {
          const generateTasks: ListrTask<Ctx>[] = Object.keys(generates).map(filename => {
            const outputConfig = generates[filename];
            const hasPreset = !!outputConfig.preset;

            const title = `Generate to ${filename}`;

            return {
              title,
              async task(_, subTask) {
                let outputSchemaAst: GraphQLSchema;
                let outputSchema: DocumentNode;
                const outputFileTemplateConfig = outputConfig.config || {};
                let outputDocuments: Types.DocumentFile[] = [];
                const outputSpecificSchemas = normalizeInstanceOrArray<Types.Schema>(outputConfig.schema);
                let outputSpecificDocuments = normalizeInstanceOrArray<Types.OperationDocument>(outputConfig.documents);

                const preset: Types.OutputPreset | null = hasPreset
                  ? typeof outputConfig.preset === 'string'
                    ? await getPresetByName(outputConfig.preset, makeDefaultLoader(context.cwd))
                    : outputConfig.preset
                  : null;

                if (preset?.prepareDocuments) {
                  outputSpecificDocuments = await preset.prepareDocuments(filename, outputSpecificDocuments);
                }

                return subTask.newListr(
                  [
                    {
                      title: 'Load GraphQL schemas',
                      task: wrapTask(
                        async () => {
                          debugLog(`[CLI] Loading Schemas`);
                          const schemaPointerMap: any = {};
                          const allSchemaDenormalizedPointers = [...rootSchemas, ...outputSpecificSchemas];

                          for (const denormalizedPtr of allSchemaDenormalizedPointers) {
                            if (typeof denormalizedPtr === 'string') {
                              schemaPointerMap[denormalizedPtr] = {};
                            } else if (typeof denormalizedPtr === 'object') {
                              Object.assign(schemaPointerMap, denormalizedPtr);
                            }
                          }

                          const hash = JSON.stringify(schemaPointerMap);
                          const result = await cache('schema', hash, async () => {
                            const outputSchemaAst = await context.loadSchema(schemaPointerMap);
                            const outputSchema = getCachedDocumentNodeFromSchema(outputSchemaAst);
                            return {
                              outputSchemaAst,
                              outputSchema,
                            };
                          });

                          outputSchemaAst = result.outputSchemaAst;
                          outputSchema = result.outputSchema;
                        },
                        filename,
                        `Load GraphQL schemas: ${filename}`,
                        ctx
                      ),
                    },
                    {
                      title: 'Load GraphQL documents',
                      task: wrapTask(
                        async () => {
                          debugLog(`[CLI] Loading Documents`);
                          const documentPointerMap: any = {};
                          const allDocumentsDenormalizedPointers = [...rootDocuments, ...outputSpecificDocuments];
                          for (const denormalizedPtr of allDocumentsDenormalizedPointers) {
                            if (typeof denormalizedPtr === 'string') {
                              documentPointerMap[denormalizedPtr] = {};
                            } else if (typeof denormalizedPtr === 'object') {
                              Object.assign(documentPointerMap, denormalizedPtr);
                            }
                          }

                          const hash = JSON.stringify(documentPointerMap);
                          const result = await cache('documents', hash, async () => {
                            try {
                              const documents = await context.loadDocuments(documentPointerMap);
                              return {
                                documents,
                              };
                            } catch (error) {
                              if (error instanceof NoTypeDefinitionsFound && config.ignoreNoDocuments) {
                                return {
                                  documents: [],
                                };
                              }

                              throw error;
                            }
                          });

                          outputDocuments = result.documents;
                        },
                        filename,
                        `Load GraphQL documents: ${filename}`,
                        ctx
                      ),
                    },
                    {
                      title: 'Generate',
                      task: wrapTask(
                        async () => {
                          debugLog(`[CLI] Generating output`);
                          const normalizedPluginsArray = normalizeConfig(outputConfig.plugins);

                          const pluginLoader = config.pluginLoader || makeDefaultLoader(context.cwd);
                          const pluginPackages = await Promise.all(
                            normalizedPluginsArray.map(plugin => getPluginByName(Object.keys(plugin)[0], pluginLoader))
                          );

                          const pluginMap: {
                            [name: string]: CodegenPlugin;
                          } = Object.fromEntries(
                            pluginPackages.map((pkg, i) => {
                              const plugin = normalizedPluginsArray[i];
                              const name = Object.keys(plugin)[0];
                              return [name, pkg];
                            })
                          );

                          const importExtension = normalizeImportExtension({
                            emitLegacyCommonJSImports: config.emitLegacyCommonJSImports,
                            importExtension: config.importExtension,
                          });

                          const mergedConfig = {
                            ...rootConfig,
                            ...(typeof outputFileTemplateConfig === 'string'
                              ? { value: outputFileTemplateConfig }
                              : outputFileTemplateConfig),
                            importExtension,
                            emitLegacyCommonJSImports: config.emitLegacyCommonJSImports ?? true,
                          };

                          const documentTransforms = Array.isArray(outputConfig.documentTransforms)
                            ? await Promise.all(
                                outputConfig.documentTransforms.map(async (config, index) => {
                                  return await getDocumentTransform(
                                    config,
                                    makeDefaultLoader(context.cwd),
                                    `the element at index ${index} of the documentTransforms`
                                  );
                                })
                              )
                            : [];

                          const outputs: Types.GenerateOptions[] = preset
                            ? await context.profiler.run(
                                async () =>
                                  preset.buildGeneratesSection({
                                    baseOutputDir: filename,
                                    presetConfig: outputConfig.presetConfig || {},
                                    plugins: normalizedPluginsArray,
                                    schema: outputSchema,
                                    schemaAst: outputSchemaAst,
                                    documents: outputDocuments,
                                    config: mergedConfig,
                                    pluginMap,
                                    pluginContext,
                                    profiler: context.profiler,
                                    documentTransforms,
                                  }),
                                `Build Generates Section: ${filename}`
                              )
                            : [
                                {
                                  filename,
                                  plugins: normalizedPluginsArray,
                                  schema: outputSchema,
                                  schemaAst: outputSchemaAst,
                                  documents: outputDocuments,
                                  config: mergedConfig,
                                  pluginMap,
                                  pluginContext,
                                  profiler: context.profiler,
                                  documentTransforms,
                                },
                              ];

                          const process = async (outputArgs: Types.GenerateOptions) => {
                            const output = await codegen({
                              ...outputArgs,
                              importExtension,
                              emitLegacyCommonJSImports: config.emitLegacyCommonJSImports ?? true,
                              cache,
                            });
                            result.push({
                              filename: outputArgs.filename,
                              content: output,
                              hooks: outputConfig.hooks || {},
                            });
                          };

                          await context.profiler.run(() => Promise.all(outputs.map(process)), `Codegen: ${filename}`);
                        },
                        filename,
                        `Generate: ${filename}`,
                        ctx
                      ),
                    },
                  ],
                  {
                    /**
                     * For each `generates` task, we must do the following in order:
                     *
                     * 1. Load schema
                     * 2. Load documents
                     * 3. Generate based on the schema + documents
                     *
                     * This way, the 3rd step has all the schema and documents loaded in previous steps to work correctly
                     */
                    exitOnError: true,
                    concurrent: false,
                  }
                );
              },
              // It doesn't stop when one of tasks failed, to finish at least some of outputs
              exitOnError: false,
            };
          });

          return task.newListr(generateTasks, { concurrent: cpus().length });
        },
      },
    ],
    {
      rendererOptions: {
        clearOutput: false,
        collapseSubtasks: true,
        formatOutput: 'wrap',
        removeEmptyLines: false,
      },
      renderer: config.verbose ? 'verbose' : 'default',
      ctx: { errors: [] },
      silentRendererCondition: isTest || config.silent,
      exitOnError: true,
    }
  );

  // All the errors throw in `listr2` are collected in context
  // Running tasks doesn't throw anything
  const executedContext = await tasks.run();
  if (config.debug) {
    // if we have debug logs, make sure to print them before throwing the errors
    printLogs();
  }

  let error: Error | null = null;
  if (executedContext.errors.length > 0) {
    const errors = executedContext.errors.map(subErr => subErr.message || subErr.toString());
    error = new AggregateError(executedContext.errors, String(errors.join('\n\n')));
    // Best-effort to all stack traces for debugging
    error.stack = `${error.stack}\n\n${executedContext.errors.map(subErr => subErr.stack).join('\n\n')}`;
  }

  return { result, error };
}
