import { Types, CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import { DetailedError, codegen } from '@graphql-codegen/core';
import { normalizeOutputParam, normalizeInstanceOrArray, normalizeConfig } from '@graphql-codegen/plugin-helpers';
import { Renderer } from './utils/listr-renderer';
import { GraphQLError, GraphQLSchema, DocumentNode, buildASTSchema } from 'graphql';
import { getPluginByName } from './plugins';
import { getPresetByName } from './presets';
import { debugLog } from './utils/debugging';
import { printSchemaWithDirectives } from '@graphql-toolkit/common';
import { CodegenContext, ensureContext } from './config';
import { parse } from 'graphql';

const Listr = require('listr');

export const defaultLoader = (mod: string) => import(mod);

export async function executeCodegen(input: CodegenContext | Types.Config): Promise<Types.FileOutput[]> {
  function wrapTask(task: () => void | Promise<void>, source?: string) {
    return async () => {
      try {
        await Promise.resolve().then(() => task());
      } catch (error) {
        if (source && !(error instanceof GraphQLError)) {
          error.source = source;
        }

        throw error;
      }
    };
  }

  const context = ensureContext(input);
  const config = context.getConfig();
  const result: Types.FileOutput[] = [];
  const commonListrOptions = {
    exitOnError: true,
  };
  let listr: import('listr');

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
      renderer: config.silent ? 'silent' : Renderer,
      nonTTYRenderer: config.silent ? 'silent' : 'default',
      collapse: true,
      clearOutput: false,
    } as any);
  }

  let rootConfig: { [key: string]: any } = {};
  let rootSchemas: Types.Schema[];
  let rootDocuments: Types.OperationDocument[];
  let generates: { [filename: string]: Types.ConfiguredOutput } = {};

  async function normalize() {
    /* Load Require extensions */
    const requireExtensions = normalizeInstanceOrArray<string>(config.require);
    for (const mod of requireExtensions) {
      await import(mod);
    }

    /* Root templates-config */
    rootConfig = config.config || {};

    /* Normalize root "schema" field */
    rootSchemas = normalizeInstanceOrArray<Types.Schema>(config.schema);

    /* Normalize root "documents" field */
    rootDocuments = normalizeInstanceOrArray<Types.OperationDocument>(config.documents);

    /* Normalize "generators" field */
    const generateKeys = Object.keys(config.generates);

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
      generates[filename] = normalizeOutputParam(config.generates[filename]);

      if (generates[filename].plugins.length === 0) {
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

    if (rootSchemas.length === 0 && Object.keys(generates).some(filename => !generates[filename].schema || generates[filename].schema.length === 0)) {
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
        Object.keys(generates).map<import('listr').ListrTask>((filename, i) => {
          const outputConfig = generates[filename];
          const hasPreset = !!outputConfig.preset;

          return {
            title: hasPreset ? `Generate to ${filename} (using EXPERIMENTAL preset "${outputConfig.preset}")` : `Generate ${filename}`,
            task: () => {
              const outputFileTemplateConfig = outputConfig.config || {};
              const outputDocuments: Types.DocumentFile[] = [];
              let outputSchemaAst: GraphQLSchema;
              let outputSchema: DocumentNode;
              const outputSpecificSchemas = normalizeInstanceOrArray<Types.Schema>(outputConfig.schema);
              const outputSpecificDocuments = normalizeInstanceOrArray<Types.OperationDocument>(outputConfig.documents);

              return new Listr(
                [
                  {
                    title: 'Load GraphQL schemas',
                    task: wrapTask(async () => {
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
                      const loadedSchema = await context.loadSchema(schemaPointerMap);
                      if (loadedSchema instanceof GraphQLSchema) {
                        outputSchemaAst = loadedSchema;
                        outputSchema = parse(printSchemaWithDirectives(loadedSchema));
                      } else {
                        outputSchema = loadedSchema;
                        outputSchemaAst = buildASTSchema(outputSchema, { assumeValidSDL: true });
                      }
                    }, filename),
                  },
                  {
                    title: 'Load GraphQL documents',
                    task: wrapTask(async () => {
                      debugLog(`[CLI] Loading Documents`);
                      const allDocuments = [...rootDocuments, ...outputSpecificDocuments];
                      const documents = await context.loadDocuments(allDocuments);

                      if (documents.length > 0) {
                        outputDocuments.push(...documents);
                      }
                    }, filename),
                  },
                  {
                    title: 'Generate',
                    task: wrapTask(async () => {
                      debugLog(`[CLI] Generating output`);
                      const normalizedPluginsArray = normalizeConfig(outputConfig.plugins);
                      const pluginLoader = config.pluginLoader || defaultLoader;
                      const pluginPackages = await Promise.all(normalizedPluginsArray.map(plugin => getPluginByName(Object.keys(plugin)[0], pluginLoader)));
                      const pluginMap: { [name: string]: CodegenPlugin } = {};
                      const preset: Types.OutputPreset = hasPreset ? (typeof outputConfig.preset === 'string' ? await getPresetByName(outputConfig.preset, defaultLoader) : outputConfig.preset) : null;

                      pluginPackages.forEach((pluginPackage, i) => {
                        const plugin = normalizedPluginsArray[i];
                        const name = Object.keys(plugin)[0];

                        pluginMap[name] = pluginPackage;
                      });

                      const mergedConfig = {
                        ...rootConfig,
                        ...(typeof outputFileTemplateConfig === 'string' ? { value: outputFileTemplateConfig } : outputFileTemplateConfig),
                      };

                      let outputs: Types.GenerateOptions[] = [];

                      if (hasPreset) {
                        outputs = await preset.buildGeneratesSection({
                          baseOutputDir: filename,
                          presetConfig: outputConfig.presetConfig || {},
                          plugins: normalizedPluginsArray,
                          schema: outputSchema,
                          schemaAst: outputSchemaAst,
                          documents: outputDocuments,
                          config: mergedConfig,
                          pluginMap,
                        });
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

                      await Promise.all(outputs.map(process));
                    }, filename),
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

  await listr.run();

  return result;
}
