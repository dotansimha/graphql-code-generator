import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface UrqlRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @name withComponent
   * @type boolean
   * @description Customized the output by enabling/disabling the generated Component.
   * @default true
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-urql
   *  config:
   *    withComponent: false
   * ```
   */
  withComponent?: boolean;
  /**
   * @name withHooks
   * @type boolean
   * @description Customized the output by enabling/disabling the generated React Hooks.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-urql
   *  config:
   *    withHooks: false
   * ```
   */
  withHooks?: boolean;
  /**
   * @name urqlImportFrom
   * @type string
   * @description You can specify module that exports components `Query`, `Mutation`, `Subscription` and HOCs
   * This is useful for further abstraction of some common tasks (eg. error handling).
   * Filepath relative to generated file can be also specified.
   * @default urql
   */
  urqlImportFrom?: string;
}
