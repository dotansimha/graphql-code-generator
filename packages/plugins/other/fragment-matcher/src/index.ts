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
  /**
   * @name module
   * @type string
   * @description Compatible only with JSON extension, allow you to choose the export type, either `module.exports` or `export default`.  Allowed values are: `commonjs`,  `es2015`.
   * @default es2015
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.json:
   *  plugins:
   *    - fragment-matcher
   *  config:
   *    module: commonjs
   * ```
   */
  module?: 'commonjs' | 'es2015';
  /**
   * @name apolloClientVersion
   * @type number
   * @description Compatible only with TS/TSX/JS/JSX extensions, allow you to generate output based on your Apollo-Client version. Valid values are: `2`, `3`.
   * @default 2
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - fragment-matcher
   *  config:
   *    apolloClientVersion: 3
   * ```
   */
  apolloClientVersion?: 2 | 3;
  federation?: boolean;
}

const extensions = {
  ts: ['.ts', '.tsx'],
  js: ['.js', '.jsx'],
  json: ['.json'],
};

export const plugin: PluginFunction = async (
  schema: GraphQLSchema,
  _documents,
  pluginConfig: FragmentMatcherConfig,
  info
): Promise<string> => {
  const config: Required<FragmentMatcherConfig> = {
    module: 'es2015',
    federation: false,
    apolloClientVersion: 2,
    ...pluginConfig,
  };

  const apolloClientVersion = parseInt(config.apolloClientVersion as any);
  const cleanSchema = config.federation ? removeFederation(schema) : schema;

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

  const filteredData: PossibleTypesResultData | IntrospectionResultData =
    apolloClientVersion === 2
      ? {
          __schema: {
            ...introspection.data.__schema,
            types: introspection.data.__schema.types.filter(type => type.kind === 'UNION' || type.kind === 'INTERFACE'),
          },
        }
      : {
          possibleTypes: introspection.data.__schema.types
            .filter(filterUnionAndInterfaceTypes)
            .reduce(createPossibleTypesCollection, {}),
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
    if (apolloClientVersion === 2) {
      return `
      export interface IntrospectionResultData {
        __schema: {
          types: {
            kind: string;
            name: string;
            possibleTypes: {
              name: string;
            }[];
          }[];
        };
      }
      const result: IntrospectionResultData = ${content};
      export default result;
    `;
    } else if (apolloClientVersion === 3) {
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
  }

  throw new Error(`Extension ${ext} is not supported`);
};

export const validate: PluginValidateFn<any> = async (
  _schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: FragmentMatcherConfig,
  outputFile: string
) => {
  const ext = extname(outputFile).toLowerCase();
  const all = Object.values(extensions).reduce((acc, exts) => [...acc, ...exts], []);

  if (!all.includes(ext)) {
    throw new Error(
      `Plugin "fragment-matcher" requires extension to be one of ${all.map(val => val.replace('.', '')).join(', ')}!`
    );
  }

  if (config.module === 'commonjs' && extensions.ts.includes(ext)) {
    throw new Error(`Plugin "fragment-matcher" doesn't support commonjs modules combined with TypeScript!`);
  }
};
