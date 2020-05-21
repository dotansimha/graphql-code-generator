import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface VueApolloRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @name withCompositionFunctions
   * @description Customized the output by enabling/disabling the generated Vue composition functions.
   * @default true
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo
   *  config:
   *    withCompositionFunctions: true
   * ```
   */
  withCompositionFunctions?: boolean;
  /**
   * @name vueApolloComposableImportFrom
   * @default @vue/apollo-composable
   */
  vueApolloComposableImportFrom?: string;
  /**
   * @name addDocBlocks
   * @description Allows you to enable/disable the generation of docblocks in generated code.
   * Some IDE's (like VSCode) add extra inline information with docblocks, you can disable this feature if your preferred IDE does not.
   * @default true
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo
   *  config:
   *    addDocBlocks: true
   * ```
   */
  addDocBlocks?: boolean;
}
