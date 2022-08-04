import { extname } from 'path';

import { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { getIntrospectedSchema, minifyIntrospectionQuery } from '@urql/introspection';

/**
 * @description This plugin generates an introspection file for Schema Awareness feature of Urql Cache Exchange
 *
 * You can read more about it in `urql` documentation: https://formidable.com/open-source/urql/docs/graphcache/schema-awareness.
 *
 * Urql Introspection plugin accepts a TypeScript / JavaScript or a JSON file as an output _(`.ts, .tsx, .js, .jsx, .json`)_.
 *
 * Both in TypeScript and JavaScript a default export is being used.
 *
 * > The output is based on the output you choose for the output file name.
 */
export interface UrqlIntrospectionConfig {
  /**
   * @description Compatible only with JSON extension, allow you to choose the export type, either `module.exports` or `export default`. Allowed values are: `commonjs`, `es2015`.
   * @default es2015
   *
   * @exampleMarkdown
   * ```yaml {6}
   * generates:
   *   path/to/file.json:
   *     plugins:
   *       - urql-introspection
   *     config:
   *       module: commonjs
   * ```
   */
  module?: 'commonjs' | 'es2015';

  /**
   * @name useTypeImports
   * @type boolean
   * @default false
   * @description Will use `import type {}` rather than `import {}` when importing only types. This gives
   * compatibility with TypeScript's "importsNotUsedAsValues": "error" option
   *
   * @example
   * ```yaml
   * config:
   *   useTypeImports: true
   * ```
   */
  useTypeImports?: boolean;
  /**
   * @name includeScalars
   * @type boolean
   * @default false
   * @description Includes scalar names (instead of an `Any` replacement) in the output when enabled.
   *
   * @example
   * ```yaml
   * config:
   *   includeScalars: true
   * ```
   */
  includeScalars?: boolean;
  /**
   * @name includeEnums
   * @type boolean
   * @default false
   * @description Includes enums (instead of an `Any` replacement) in the output when enabled.
   *
   * @example
   * ```yaml
   * config:
   *   includeEnums: true
   * ```
   */
  includeEnums?: boolean;
  /**
   * @name includeInputs
   * @type boolean
   * @default false
   * @description Includes all input objects (instead of an `Any` replacement) in the output when enabled.
   *
   * @example
   * ```yaml
   * config:
   *   includeInputs: true
   * ```
   */
  includeInputs?: boolean;
  /**
   * @name includeDirectives
   * @type boolean
   * @default false
   * @description Includes all directives in the output when enabled.
   *
   * @example
   * ```yaml
   * config:
   *   includeDirectives: true
   * ```
   */
  includeDirectives?: boolean;
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
  const config: UrqlIntrospectionConfig = {
    module: 'es2015',
    useTypeImports: false,
    ...pluginConfig,
  };

  const ext = extname(info.outputFile).toLowerCase();

  const minifiedData = minifyIntrospectionQuery(getIntrospectedSchema(schema), {
    includeDirectives: config.includeDirectives,
    includeEnums: config.includeEnums,
    includeInputs: config.includeInputs,
    includeScalars: config.includeScalars,
  });

  const content = JSON.stringify(minifiedData, null, 2);

  if (extensions.json.includes(ext)) {
    return content;
  }

  if (extensions.js.includes(ext)) {
    const defaultExportStatement = config.module === 'es2015' ? `export default` : 'module.exports =';

    return `${defaultExportStatement} ${content}`;
  }

  if (extensions.ts.includes(ext)) {
    const typeImport = config.useTypeImports ? 'import type' : 'import';
    return `${typeImport} { IntrospectionQuery } from 'graphql';
export default ${content} as unknown as IntrospectionQuery;`;
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

  if (config.useTypeImports && !extensions.ts.includes(ext)) {
    throw new Error(`Plugin "urql-introspection" doesn't support useTypeImports modules not combined with TypeScript!`);
  }
};
