import { FileOutput, DocumentFile, Types, debugLog } from 'graphql-codegen-core';
import Listr from 'listr';
import { normalizeOutputParam, normalizeInstanceOrArray, normalizeConfig } from './helpers';
import { prettify } from './utils/prettier';
import { Renderer } from './utils/listr-renderer';
import { DetailedError } from './errors';
import { loadSchema, loadDocuments } from './load';
import { mergeSchemas } from './merge-schemas';
import { GraphQLError, DocumentNode, visit } from 'graphql';
import { executePlugin, getPluginByName } from './execute-plugin';

export interface GenerateOutputOptions {
  filename: string;
  plugins: Types.ConfiguredPlugin[];
  schema: DocumentNode;
  documents: DocumentFile[];
  pluginLoader: Types.PluginLoaderFn;
  inheritedConfig: { [key: string]: any };
}

export async function executeCodegen(config: Types.Config): Promise<FileOutput[]> {
  function wrapTask(task: () => void | Promise<void>, source?: string) {
    return async () => {
      try {
        await task();
      } catch (error) {
        if (source && !(error instanceof GraphQLError)) {
          error.source = source;
        }

        throw error;
      }
    };
  }

  const result: FileOutput[] = [];
  const commonListrOptions = {
    exitOnError: true
  };
  let listr: Listr;

  if (process.env.VERBOSE) {
    listr = new Listr({
      ...commonListrOptions,
      renderer: 'verbose',
      nonTTYRenderer: 'verbose'
    });
  } else if (process.env.NODE_ENV === 'test') {
    listr = new Listr({
      ...commonListrOptions,
      renderer: 'silent',
      nonTTYRenderer: 'silent'
    });
  } else {
    listr = new Listr({
      ...commonListrOptions,
      renderer: config.silent ? 'silent' : Renderer,
      nonTTYRenderer: config.silent ? 'silent' : 'default',
      collapse: true,
      clearOutput: false
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

    if (rootSchemas.length === 0 && Object.keys(generates).some(filename => generates[filename].schema.length === 0)) {
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
    task: () => normalize()
  });

  listr.add({
    title: 'Generate outputs',
    task: () => {
      return new Listr(
        Object.keys(generates).map<Listr.ListrTask>((filename, i) => ({
          title: `Generate ${filename}`,
          task: () => {
            const outputConfig = generates[filename];
            const outputFileTemplateConfig = outputConfig.config || {};
            const outputDocuments: DocumentFile[] = [];
            let outputSchema: DocumentNode;
            const outputSpecificSchemas = normalizeInstanceOrArray<Types.Schema>(outputConfig.schema);
            const outputSpecificDocuments = normalizeInstanceOrArray<Types.OperationDocument>(outputConfig.documents);

            return new Listr(
              [
                {
                  title: 'Load GraphQL schemas',
                  task: wrapTask(async () => {
                    debugLog(`[CLI] Loading Schemas`);
                    const allSchemas = [
                      ...rootSchemas.map(pointToScehma => loadSchema(pointToScehma, config)),
                      ...outputSpecificSchemas.map(pointToScehma => loadSchema(pointToScehma, config))
                    ];

                    if (allSchemas.length > 0) {
                      outputSchema = await mergeSchemas(await Promise.all(allSchemas));
                    }
                  }, filename)
                },
                {
                  title: 'Load GraphQL documents',
                  task: wrapTask(async () => {
                    debugLog(`[CLI] Loading Documents`);
                    const allDocuments = [...rootDocuments, ...outputSpecificDocuments];

                    for (const docDef of allDocuments) {
                      const documents = await loadDocuments(docDef, config);

                      if (documents.length > 0) {
                        outputDocuments.push(...documents);
                      }
                    }
                  }, filename)
                },
                {
                  title: 'Generate',
                  task: wrapTask(async () => {
                    debugLog(`[CLI] Generating output`);
                    const normalizedPluginsArray = normalizeConfig(outputConfig.plugins);
                    const output = await generateOutput({
                      filename,
                      plugins: normalizedPluginsArray,
                      schema: outputSchema,
                      documents: outputDocuments,
                      inheritedConfig: {
                        ...rootConfig,
                        ...outputFileTemplateConfig
                      },
                      pluginLoader: config.pluginLoader || require
                    });
                    result.push(output);
                  }, filename)
                }
              ],
              {
                // it stops when one of tasks failed
                exitOnError: true
              }
            );
          }
        })),
        {
          // it doesn't stop when one of tasks failed, to finish at least some of outputs
          exitOnError: false,
          // run 4 at once
          concurrent: 4
        }
      );
    }
  });

  await listr.run();

  return result;
}

function validateDocuments(schema: DocumentNode, files: DocumentFile[]) {
  // duplicated names
  const operationMap: {
    [name: string]: string[];
  } = {};

  files.forEach(file => {
    visit(file.content, {
      OperationDefinition(node) {
        if (typeof node.name !== 'undefined') {
          if (!operationMap[node.name.value]) {
            operationMap[node.name.value] = [];
          }

          operationMap[node.name.value].push(file.filePath);
        }
      }
    });
  });

  const names = Object.keys(operationMap);

  if (names.length) {
    const duplicated = names.filter(name => operationMap[name].length > 1);

    if (!duplicated.length) {
      return;
    }

    const list = duplicated
      .map(name =>
        `
      * ${name} found in:
        ${operationMap[name]
          .map(filepath => {
            return `
            - ${filepath}
          `.trimRight();
          })
          .join('')}
  `.trimRight()
      )
      .join('');
    throw new DetailedError(
      `Not all operations have an unique name: ${duplicated.join(', ')}`,
      `
        Not all operations have an unique name

        ${list}
      `
    );
  }
}

export async function generateOutput(options: GenerateOutputOptions): Promise<FileOutput> {
  let output = '';

  validateDocuments(options.schema, options.documents);

  const pluginsPackages = await Promise.all(
    options.plugins.map(plugin => getPluginByName(Object.keys(plugin)[0], options.pluginLoader))
  );

  // merged schema with parts added by plugins
  const schema = pluginsPackages.reduce((schema, plugin) => {
    return !plugin.addToSchema ? schema : mergeSchemas([schema, plugin.addToSchema]);
  }, options.schema);

  for (let i = 0; i < options.plugins.length; i++) {
    const plugin = options.plugins[i];
    const pluginPackage = pluginsPackages[i];
    const name = Object.keys(plugin)[0];
    const pluginConfig = plugin[name];

    debugLog(`[CLI] Running plugin: ${name}`);

    const result = await executePlugin(
      {
        name,
        config:
          typeof pluginConfig !== 'object'
            ? pluginConfig
            : {
                ...options.inheritedConfig,
                ...(pluginConfig as object)
              },
        schema,
        documents: options.documents,
        outputFilename: options.filename,
        allPlugins: options.plugins
      },
      pluginPackage
    );

    debugLog(`[CLI] Completed executing plugin: ${name}`);

    output += result;
  }

  return { filename: options.filename, content: await prettify(options.filename, output) };
}
