export type ApolloClientHelpersConfig = {
  /**
   * @name useTypeImports
   * @type boolean
   * @default false
   * @description Will use `import type {}` rather than `import {}` when importing only types. This gives
   * compatibility with TypeScript's "importsNotUsedAsValues": "error" option
   *
   * @example
   * ```yml
   * config:
   *   useTypeImports: true
   * ```
   */
  useTypeImports?: boolean;
};
