import { extname } from 'path';

import { PluginFunction, PluginValidateFn, Types, removeFederation } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, execute, parse } from 'graphql';

interface IntrospectionResultData {
  __schema: {
    types: {
      kind: string;
      name: string;
      possibleTypes:
        | {
            name: string;
          }[]
        | null;
    }[];
  };
}

interface PossibleTypesResultData {
  possibleTypes: {
    [key: string]: string[];
  };
}

export interface FragmentMatcherConfig {
  module?: 'commonjs' | 'es2015';
  federation?: boolean;
}

const extensions = {
  ts: ['.ts', '.tsx'],
  js: ['.js', '.jsx'],
  json: ['.json'],
};

export const plugin: PluginFunction = async (schema: GraphQLSchema, _documents, pluginConfig: FragmentMatcherConfig, info): Promise<string> => {
  const config: Required<FragmentMatcherConfig> = {
    module: 'es2015',
    federation: false,
    ...pluginConfig,
  };

  const cleanSchema = config.federation
    ? removeFederation(schema, {
        withDirectives: false,
      })
    : schema;

  const introspection = await execute<IntrospectionResultData>({
    schema: cleanSchema,
    document: parse(`
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `),
  });
  const ext = extname(info.outputFile).toLowerCase();

  if (!introspection.data) {
    throw new Error(`Plugin "fragment-matcher" couldn't introspect the schema`);
  }

  const filterUnionAndInterfaceTypes = type => type.kind === 'UNION' || type.kind === 'INTERFACE';
  const createPossibleTypesCollection = (acc, type) => {
    return { ...acc, ...{ [type.name]: type.possibleTypes.map(possibleType => possibleType.name) } };
  };

  const filteredData: PossibleTypesResultData = {
    possibleTypes: introspection.data.__schema.types.filter(filterUnionAndInterfaceTypes).reduce(createPossibleTypesCollection, {}),
  };

  const content = JSON.stringify(filteredData, null, 2);

  if (extensions.json.includes(ext)) {
    return content;
  }

  if (extensions.js.includes(ext)) {
    const defaultExportStatement = config.module === 'es2015' ? `export default` : 'module.exports =';

    return `
      ${defaultExportStatement} ${content}
    `;
  }

  if (extensions.ts.includes(ext)) {
    return `
      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }

      const result: PossibleTypesResultData = ${content};

      export default result;
    `;
  }

  throw new Error(`Extension ${ext} is not supported`);
};

export const validate: PluginValidateFn<any> = async (_schema: GraphQLSchema, _documents: Types.DocumentFile[], config: FragmentMatcherConfig, outputFile: string) => {
  const ext = extname(outputFile).toLowerCase();
  const all = Object.values(extensions).reduce((acc, exts) => [...acc, ...exts], []);

  if (!all.includes(ext)) {
    throw new Error(`Plugin "fragment-matcher" requires extension to be one of ${all.map(val => val.replace('.', '')).join(', ')}!`);
  }

  if (config.module === 'commonjs' && extensions.ts.includes(ext)) {
    throw new Error(`Plugin "fragment-matcher" doesn't support commonjs modules combined with TypeScript!`);
  }
};
