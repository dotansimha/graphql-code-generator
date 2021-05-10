import { validateTs } from '@graphql-codegen/testing';
import { DocumentNode, GraphQLSchema } from 'graphql';
import { Types, mergeOutputs, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { load as yamlLoad } from 'js-yaml';

/* The mock-plugin helps to test a plugin by preparing an environment with schema, documents and plugins
 * registered. The function returned `runPlugin` needs a config similar to user's `codegen.yml` then
 * returns the main (= the tested) plugin output `Types.PluginOutput`.
 *
 * Warns in yaml content:
 * 1. the schema field should be declared,
 * 2. the documents list should refer to the documents dictionary in mock-plugin construction,
 * 3. it works for only one generated file,
 * 4. the plugins next to the main (= the tested) plugin helps to validate typescript.
 *
 * Reminder codegen.yml format:
 * ```yaml
 * overwrite: true  #other props are ignored
 * schema:
 *   - any          #mandatory
 *   documents:
 *   - basicDoc     #should refer to documents dictionary at mock-plugin contruction
 * generates:
 *   src/graphql/generated.ts:
 *     plugins:
 *       - typescript                       #for typescript validation only
 *       - typescript-operations            #for typescript validation only
 *       - typescript-svelte-apollo
 *     config:
 *       loadGetClientFrom: svelte-apollo   #config options are used by every plugins
 * ```
 */

type YamlConfig<D extends string, P extends string> = {
  schema: string | string[];
  documents?: D | D[];
  generates: Record<string, { config?: Record<string, any>; plugins?: P[] }>;
};

/**
 * Returns a function `runPlugin` for executing a codegen.yml parsed content. The function `runPlugin`
 * mock the plugin calls and validates typescript or throws an error.
 * @param {Object} schema GraphQLSchema
 * @param {Object} documents a DocumentNode dictionary
 * @param {Object} plugins a PluginFunction dictionary
 * @param {string} pluginName a key of `plugins` dictionary
 * @returns {Function} a function `runPlugin` executes a codegen.yml parsed content.
 *
 * @exampleMarkdown
 * ```typescript
 * const runPlugin = mockPlugin(schema, documents, plugins, "myTestedPlugin");
 * const content = await runPlugin(yaml`...`);
 * ```
 */

export function mockPlugin<
  T extends Types.PluginOutput = Types.PluginOutput,
  D extends string = string,
  U extends string = string,
  P extends Record<U, PluginFunction> = Record<U, PluginFunction>
>(schema: GraphQLSchema, documents: Record<D, DocumentNode>, plugins: P, pluginName: keyof P) {
  const loadCodegen = ({ schema: hasSchema, documents: docs, generates }: YamlConfig<D, U>) => {
    const outputFile = Object.keys(generates)[0];
    const output = generates[outputFile];
    const found = (Array.isArray(docs) ? docs : [docs]).map(location => {
      if (!documents[location]) {
        throw new Error(`Document ${location} not found`);
      }
      return {
        location,
        document: documents[location],
        rawSDL: documents[location].loc.source.body,
      };
    }) as Types.DocumentFile[];
    return {
      schema: (hasSchema ? schema : {}) as GraphQLSchema,
      documents: found,
      config: output.config || {},
      info: { outputFile, plugins: output.plugins },
    };
  };

  const validateTypeScript = async (
    output: Types.PluginOutput,
    schema: GraphQLSchema,
    documents: Types.DocumentFile[],
    config: any,
    info: { outputFile: string; plugins: string[] }
  ) => {
    const outputs = info.plugins.map(pname => {
      if (!plugins[pname]) {
        throw new Error(`Plugin ${pname} not found`);
      }
      if (pname === 'typescript-svelte-apollo') {
        return output;
      }
      return plugins[pname](schema, [...documents], { ...config }, { ...info }) as Types.PluginOutput;
    });
    const merged = mergeOutputs(outputs);
    validateTs(merged);

    return merged;
  };

  const runPlugin = async (yamlConfig: YamlConfig<D, U>): Promise<T> => {
    const { schema, documents, config, info } = loadCodegen(yamlConfig);
    const content = await plugins[pluginName](schema, [...documents], { ...config }, { ...info });
    await validateTypeScript(content, schema, documents, config, info);
    return content as any;
  };

  return runPlugin;
}

const isString = (item: unknown): item is string => typeof item === 'string';

/**
 * The yaml literal function read the string then output parsed yaml. You can override expected output typescript format.
 * @param {(string|string[])} literals readonly
 * @param {...*} rest readonly
 * @returns {(string|number|Object)} yaml output
 *
 * @example
 * // returns { "" }
 * yaml`
 * overwrite: true
 * `
 */

export const yaml = <T = string | number | object>(literals: string | TemplateStringsArray, ...rest: any[]): T =>
  yamlLoad(
    isString(literals) ? literals : literals.map((item, i) => `${item}${rest[i] !== undefined ? rest[i] : ''}`).join('')
  ) as any;
