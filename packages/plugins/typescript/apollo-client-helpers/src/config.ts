export type ApolloClientHelpersConfig = {
  /**
   * @name useTypeImports
   * @type boolean
   * @default false
   * @description Will use `import type {}` rather than `import {}` when importing only types. This gives
   * compatibility with TypeScript's "importsNotUsedAsValues": "error" option
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          useTypeImports: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  useTypeImports?: boolean;
  /**
   * @name requireKeyFields
   * @type boolean
   * @default false
   * @description Remove optional sign from all `keyFields` fields.
   *
   */
  requireKeyFields?: boolean;
  /**
   * @name requirePoliciesForAllTypes
   * @type boolean
   * @default false
   * @description Remove optional sign from all generated keys of the root TypePolicy.
   *
   */
  requirePoliciesForAllTypes?: boolean;
  /**
   * @name baseTypesPath
   * @type string
   * @description The base schema types file, used to type `FieldPolicy` and `FieldReadFunction`.
   *
   */
  baseTypesPath?: string;
  /**
   * @description A flag to disable adding `.js` extension to the output file. Default: `true`.
   */
  emitLegacyCommonJSImports?: boolean;
};
