import { extname } from 'path';

import { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { getIntrospectedSchema, minifyIntrospectionQuery } from '@urql/introspection';

/**
 * @description This plugin generates an introspection file but only with Interfaces and Unions, based on your GraphQLSchema.
 *
 * If you are using `urql` and your schema contains `interface` or `union` declaration, it's recommended to use provide an introspection to enable Schema Awareness.
 *
 * You can read more about it in `urql` documentation: https://formidable.com/open-source/urql/docs/graphcache/schema-awareness/.
 *
 * Urql Introspection plugin accepts a TypeScript / JavaScript or a JSON file as an output _(`.ts, .tsx, .js, .jsx, .json`)_.
 *
 * Both in TypeScript and JavaScript a default export is being used.
 *
 * > The output is based on the output you choose for the output file name.
 */
export interface UrqlIntrospectionConfig {
  /**
   * @description Compatible only with JSON extension, allow you to choose the export type, either `module.exports` or `export default`.  Allowed values are: `commonjs`,  `es2015`.
   * @default es2015
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.json:
   *  plugins:
   *    - urql-introspection
   *  config:
   *    module: commonjs
   * ```
   */
  module?: 'commonjs' | 'es2015';
}

const extensions = {
  ts: ['.ts', '.tsx'],
  js: ['.js', '.jsx'],
  json: ['.json'],
};

export const plugin: PluginFunction = async (
  schema: GraphQLSchema,
  _documents,
  pluginConfig: UrqlIntrospectionConfig,
  info
): Promise<string> => {
  const config: Required<UrqlIntrospectionConfig> = {
    module: 'es2015',
    ...pluginConfig,
  };

  const ext = extname(info.outputFile).toLowerCase();

  const minifiedData = minifyIntrospectionQuery(minifyIntrospectionQuery(getIntrospectedSchema(schema)));

  const content = JSON.stringify(minifiedData, null, 2);

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
      import { IntrospectionQuery } from 'graphql';

      const result: IntrospectionQuery = ${content};
      export default result;
    `;
  }

  throw new Error(`Extension ${ext} is not supported`);
};

export const validate: PluginValidateFn<any> = async (
  _schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: UrqlIntrospectionConfig,
  outputFile: string
) => {
  const ext = extname(outputFile).toLowerCase();
  const all = Object.values(extensions).reduce((acc, exts) => [...acc, ...exts], []);

  if (!all.includes(ext)) {
    throw new Error(
      `Plugin "urql-introspection" requires extension to be one of ${all.map(val => val.replace('.', '')).join(', ')}!`
    );
  }

  if (config.module === 'commonjs' && extensions.ts.includes(ext)) {
    throw new Error(`Plugin "urql-introspection" doesn't support commonjs modules combined with TypeScript!`);
  }
};
