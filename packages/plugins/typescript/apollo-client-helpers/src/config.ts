export type ApolloClientHelpersConfig = {
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
};
