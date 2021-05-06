import { validateTs } from '@graphql-codegen/testing';
import { DocumentNode, GraphQLSchema } from 'graphql';
import { Types, mergeOutputs, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { load as yamlLoad } from 'js-yaml';

type YamlConfig<D extends string, P extends string> = {
  schema: string[];
  documents?: D[];
  generates: Record<string, { config?: Record<string, any>; plugins?: P[] }>;
};

export function mockPlugin<
  T extends Types.PluginOutput = Types.PluginOutput,
  D extends string = string,
  P extends Record<U, PluginFunction> = Record<string, PluginFunction>,
  U extends string = string
>(schema: GraphQLSchema, documents: Record<D, DocumentNode>, plugins: P, pluginName: keyof P) {
  const loadCodegen = ({ schema: isSchema, documents: docs, generates }: YamlConfig<D, U>) => {
    const outputFile = Object.keys(generates)[0];
    const output = generates[outputFile];
    const found = docs.map(location => {
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
      schema: (isSchema ? schema : {}) as GraphQLSchema,
      documents: found,
      config: output.config || {},
      info: { outputFile, plugins: output.plugins },
    };
  };

  const validateTypeScript = async (
    output: Types.PluginOutput,
    testSchema: GraphQLSchema,
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
      return plugins[pname](testSchema, documents, config, {
        outputFile: '',
      }) as Types.PluginOutput;
    });
    const merged = mergeOutputs(outputs);
    validateTs(merged);

    return merged;
  };

  const runPlugin = async (yamlConfig: YamlConfig<D, U>): Promise<T> => {
    const { schema, documents, config, info } = loadCodegen(yamlConfig);
    const content = await plugins[pluginName](schema, documents, config, info);
    await validateTypeScript(content, schema, documents, config, info);
    return content as any;
  };

  return runPlugin;
}

const isString = (item: unknown): item is string => typeof item === 'string';

export const yaml = <T = string | number | object>(literals: string | TemplateStringsArray, ...rest: any[]): T =>
  yamlLoad(
    isString(literals) ? literals : literals.map((item, i) => `${item}${rest[i] !== undefined ? rest[i] : ''}`).join('')
  ) as any;
