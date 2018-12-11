import { GraphQLSchema, parse, execute } from 'graphql';
import { PluginFunction, PluginValidateFn, DocumentFile } from 'graphql-codegen-core';
import { extname } from 'path';

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

export interface FragmentMatcherConfig {
  module?: 'commonjs' | 'es2015';
}

const extensions = {
  ts: ['.ts', '.tsx'],
  js: ['.js', '.jsx'],
  json: ['.json']
};

export const plugin: PluginFunction = async (
  schema: GraphQLSchema,
  _documents,
  pluginConfig: FragmentMatcherConfig,
  info
): Promise<string> => {
  const config: Required<FragmentMatcherConfig> = {
    module: 'es2015',
    ...pluginConfig
  };

  const introspection = await execute({
    schema,
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
    `)
  });
  const ext = extname(info.outputFile).toLowerCase();

  if (extensions.json.includes(ext)) {
    return JSON.stringify(introspection.data, null, 2);
  }

  if (extensions.js.includes(ext)) {
    const defaultExportStatement = config.module === 'es2015' ? `export default` : 'module.exports =';

    return `
      ${defaultExportStatement} ${JSON.stringify(introspection.data, null, 2)}
    `;
  }

  if (extensions.ts.includes(ext)) {
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

      const result: IntrospectionResultData = ${JSON.stringify(introspection.data, null, 2)};

      export default result;
    `;
  }

  throw new Error(`Extension ${ext} is not supported`);
};

export const validate: PluginValidateFn<any> = async (
  _schema: GraphQLSchema,
  _documents: DocumentFile[],
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
