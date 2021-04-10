import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates Vue Apollo smart query functions with TypeScript typings.
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 *
 */
export interface VueApolloSmartOpsRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Customized the output by enabling/disabling the generated Vue Apollo smart query functions.
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo-smart-ops
   *  config:
   *    withSmartOperationFunctions: true
   * ```
   */
  withSmartOperationFunctions?: boolean;
  /**
   * @name vueApolloOperationFunctionsImportFrom
   * @default vue-apollo-smart-ops
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo-smart-ops
   *  config:
   *    vueApolloOperationFunctionsImportFrom: vue-apollo-smart-ops
   * ```
   */
  vueApolloOperationFunctionsImportFrom?: 'vue-apollo-smart-ops' | string;
  /**
   * @name vueApolloErrorType
   * @default ApolloError
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo-smart-ops
   *  config:
   *    vueApolloErrorType: ApolloError
   *    vueApolloErrorTypeImportFrom: apollo-client
   * ```
   */
  vueApolloErrorType?: 'ApolloError' | string;
  /**
   * @name vueApolloErrorTypeImportFrom
   * @default vue-apollo-smart-ops
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo-smart-ops
   *  config:
   *    vueApolloErrorType: ApolloError
   *    vueApolloErrorTypeImportFrom: apollo-client
   * ```
   */
  vueApolloErrorTypeImportFrom?: 'apollo-client' | string;
  /**
   * @name vueApolloErrorType
   * @default undefined
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo-smart-ops
   *  config:
   *    vueApolloErrorHandlerFunction: handleApolloError
   *    vueApolloErrorHandlerFunctionImportFrom: ./src/handleApolloError.ts
   * ```
   */
  vueApolloErrorHandlerFunction?: string;
  /**
   * @name vueApolloErrorHandlerFunctionImportFrom
   * @default undefined
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo-smart-ops
   *  config:
   *    vueApolloErrorHandlerFunction: handleApolloError
   *    vueApolloErrorHandlerFunctionImportFrom: ./src/handleApolloError.ts
   * ```
   */
  vueApolloErrorHandlerFunctionImportFrom?: string;
  /**
   * @name vueAppType
   * @default undefined
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo-smart-ops
   *  config:
   *    vueAppType: Vue
   *    vueAppTypeImportFrom: vue/types/vue
   * ```
   */
  vueAppType?: string;
  /**
   * @name vueAppTypeImportFrom
   * @default undefined
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo-smart-ops
   *  config:
   *    vueAppType: Vue
   *    vueAppTypeImportFrom: vue/types/vue
   * ```
   */
  vueAppTypeImportFrom?: string;
  /**
   * @description Allows you to enable/disable the generation of docblocks in generated code.
   * Some IDE's (like VSCode) add extra inline information with docblocks, you can disable this feature if your preferred IDE does not.
   * @default true
   *
   * @exampleMarkdown
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
