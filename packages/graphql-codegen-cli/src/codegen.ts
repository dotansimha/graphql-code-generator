import {
  DetailedError,
  Types,
  CodegenPlugin,
  normalizeOutputParam,
  normalizeInstanceOrArray,
  normalizeConfig,
  getCachedDocumentNodeFromSchema,
  isDetailedError,
} from '@graphql-codegen/plugin-helpers';
import { codegen } from '@graphql-codegen/core';

import { Renderer, ErrorRenderer } from './utils/listr-renderer';
import { GraphQLError, GraphQLSchema, DocumentNode } from 'graphql';
import { getPluginByName } from './plugins';
import { getPresetByName } from './presets';
import { debugLog } from './utils/debugging';
import { CodegenContext, ensureContext } from './config';
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line
import { createRequire } from 'module';
import Listr from 'listr';
import { isListrError } from './utils/cli-error';

const makeDefaultLoader = (from: string) => {
  if (fs.statSync(from).isDirectory()) {
    from = path.join(from, '__fake.js');
  }

  const relativeRequire = createRequire(from);

  return (mod: string) => {
    return import(relativeRequire.resolve(mod));
  };
};

// TODO: Replace any with types
function createCache<T>(loader: (key: string) => Promise<T>) {
  const cache = new Map<string, Promise<T>>();

  return {
    load(key: string): Promise<T> {
      if (cache.has(key)) {
        return cache.get(key);
      }

      const value = loader(key);

      cache.set(key, value);
      return value;
    },
  };
}

export async function executeCodegen(input: CodegenContext | Types.Config): Promise<Types.FileOutput[]> {
  const context = ensureContext(input);
  const config = context.getConfig();
  const pluginContext = context.getPluginContext();
  const result: Types.FileOutput[] = [];
  const commonListrOptions = {
    exitOnError: true,
  };
  let listr: Listr;

  if (process.env.VERBOSE) {
    listr = new Listr({
      ...commonListrOptions,
      renderer: 'verbose',
      nonTTYRenderer: 'verbose',
    });
  } else if (process.env.NODE_ENV === 'test') {
    listr = new Listr({
      ...commonListrOptions,
      renderer: 'silent',
      nonTTYRenderer: 'silent',
    });
  } else {
    listr = new Listr({
      ...commonListrOptions,
      renderer: config.silent ? 'silent' : config.errorsOnly ? ErrorRenderer : Renderer,
      nonTTYRenderer: config.silent ? 'silent' : 'default',
      collapse: true,
      clearOutput: false,
    } as any);
  }

  let rootConfig: { [key: string]: any } = {};
  let rootSchemas: Types.Schema[];
  let rootDocuments: Types.OperationDocument[];
  const generates: { [filename: string]: Types.ConfiguredOutput } = {};

  const schemaLoadingCache = createCache(async function (hash) {
    const outputSchemaAst = await context.loadSchema(JSON.parse(hash));
    const outputSchema = getCachedDocumentNodeFromSchema(outputSchemaAst);
    return {
      outputSchemaAst: outputSchemaAst,
      outputSchema: outputSchema,
    };
  });

  const documentsLoadingCache = createCache(async function (hash) {
    const documents = await context.loadDocuments(JSON.parse(hash));
    return {
      documents: documents,
    };
  });
  function wrapTask(task: () => void | Promise<void>, source: string, taskName: string) {
    return () => {
      return context.profiler.run(async () => {
        try {
          await Promise.resolve().then(() => task());
        } catch (error) {
          if (source && !(error instanceof GraphQLError)) {
            error.source = source;
          }

          throw error;
        }
      }, taskName);
    };
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
      throw new DetailedError(
        'Invalid Codegen Configuration!',
        `
        Please make sure that your codegen config file contains the "generates" field, with a specification for the plugins you need.

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

    for (const filename of generateKeys) {
      const output = (generates[filename] = normalizeOutputParam(config.generates[filename]));

      if (!output.preset && (!output.plugins || output.plugins.length === 0)) {
        throw new DetailedError(
          'Invalid Codegen Configuration!',
          `
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
      Object.keys(generates).some(filename => !generates[filename].schema || generates[filename].schema.length === 0)
    ) {
      throw new DetailedError(
        'Invalid Codegen Configuration!',
        `
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

  listr.add({
    title: 'Parse configuration',
    task: () => normalize(),
  });

  listr.add({
    title: 'Generate outputs',
    task: () => {
      return new Listr(
        Object.keys(generates).map<import('listr').ListrTask>(filename => {
          const outputConfig = generates[filename];
          const hasPreset = !!outputConfig.preset;

          return {
            title: hasPreset
              ? `Generate to ${filename} (using EXPERIMENTAL preset "${outputConfig.preset}")`
              : `Generate ${filename}`,
            task: () => {
              let outputSchemaAst: GraphQLSchema;
              let outputSchema: DocumentNode;
              const outputFileTemplateConfig = outputConfig.config || {};
              const outputDocuments: Types.DocumentFile[] = [];
              const outputSpecificSchemas = normalizeInstanceOrArray<Types.Schema>(outputConfig.schema);
              const outputSpecificDocuments = normalizeInstanceOrArray<Types.OperationDocument>(outputConfig.documents);

              return new Listr(
                [
                  {
                    title: 'Load GraphQL schemas',
                    task: wrapTask(
                      async () => {
                        debugLog(`[CLI] Loading Schemas`);

                        const schemaPointerMap: any = {};
                        const allSchemaUnnormalizedPointers = [...rootSchemas, ...outputSpecificSchemas];
                        for (const unnormalizedPtr of allSchemaUnnormalizedPointers) {
                          if (typeof unnormalizedPtr === 'string') {
                            schemaPointerMap[unnormalizedPtr] = {};
                          } else if (typeof unnormalizedPtr === 'object') {
                            Object.assign(schemaPointerMap, unnormalizedPtr);
                          }
                        }

                        const hash = JSON.stringify(schemaPointerMap);
                        const result = await schemaLoadingCache.load(hash);

                        outputSchemaAst = await result.outputSchemaAst;
                        outputSchema = result.outputSchema;
                      },
                      filename,
                      `Load GraphQL schemas: ${filename}`
                    ),
                  },
                  {
                    title: 'Load GraphQL documents',
                    task: wrapTask(
                      async () => {
                        debugLog(`[CLI] Loading Documents`);

                        // get different cache for shared docs and output specific docs
                        const results = await Promise.all(
                          [rootDocuments, outputSpecificDocuments].map(docs => {
                            const hash = JSON.stringify(docs);
                            return documentsLoadingCache.load(hash);
                          })
                        );

                        const documents: Types.DocumentFile[] = [];

                        results.forEach(source => documents.push(...source.documents));

                        if (documents.length > 0) {
                          outputDocuments.push(...documents);
                        }
                      },
                      filename,
                      `Load GraphQL documents: ${filename}`
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
                        const pluginMap: { [name: string]: CodegenPlugin } = {};
                        const preset: Types.OutputPreset = hasPreset
                          ? typeof outputConfig.preset === 'string'
                            ? await getPresetByName(outputConfig.preset, makeDefaultLoader(context.cwd))
                            : outputConfig.preset
                          : null;

                        pluginPackages.forEach((pluginPackage, i) => {
                          const plugin = normalizedPluginsArray[i];
                          const name = Object.keys(plugin)[0];

                          pluginMap[name] = pluginPackage;
                        });

                        const mergedConfig = {
                          ...rootConfig,
                          ...(typeof outputFileTemplateConfig === 'string'
                            ? { value: outputFileTemplateConfig }
                            : outputFileTemplateConfig),
                        };

                        let outputs: Types.GenerateOptions[] = [];

                        if (hasPreset) {
                          outputs = await context.profiler.run(
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
                              }),
                            `Build Generates Section: ${filename}`
                          );
                        } else {
                          outputs = [
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
                            },
                          ];
                        }

                        const process = async (outputArgs: Types.GenerateOptions) => {
                          const output = await codegen(outputArgs);
                          result.push({
                            filename: outputArgs.filename,
                            content: output,
                            hooks: outputConfig.hooks || {},
                          });
                        };

                        await context.profiler.run(() => Promise.all(outputs.map(process)), `Codegen: ${filename}`);
                      },
                      filename,
                      `Generate: ${filename}`
                    ),
                  },
                ],
                {
                  // it stops when one of tasks failed
                  exitOnError: true,
                }
              );
            },
          };
        }),
        {
          // it doesn't stop when one of tasks failed, to finish at least some of outputs
          exitOnError: false,
          // run 4 at once
          concurrent: 4,
        }
      );
    },
  });

  try {
    await listr.run();
  } catch (err) {
    if (isListrError(err)) {
      const allErrs = err.errors.map(subErr =>
        isDetailedError(subErr)
          ? `${subErr.message} for "${subErr.source}"${subErr.details}`
          : subErr.message || subErr.toString()
      );
      const newErr = new DetailedError(`${err.message} ${allErrs.join('\n\n')}`, '');
      // Best-effort to all stack traces for debugging
      newErr.stack = `${newErr.stack}\n\n${err.errors.map(subErr => subErr.stack).join('\n\n')}`;
      throw newErr;
    }
    throw err;
  }

  // await listr.run();

  return result;
}
