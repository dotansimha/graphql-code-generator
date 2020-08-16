import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates `urql` (https://github.com/FormidableLabs/urql) components and HOC with TypeScript typings.
 */
export interface UrqlRawPluginConfig extends RawClientSideBasePluginConfig {
    /**
   * @name withAdditionalTypenames
   * @type boolean
   * @description Adds the additionalTypenames to queries for refetching when for instance a list is empty.
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
   *    withAdditionalTypenames: true
   * ```
   */
  withAdditionalTypenames?: boolean;
  /**
   * @description Customized the output by enabling/disabling the generated Component.
   * @default false
   */
  withComponent?: boolean;
  /**
   * @description Customized the output by enabling/disabling the generated React Hooks.
   * @default true
   *
   */
  withHooks?: boolean;
  /**
   * @description You can specify module that exports components `Query`, `Mutation`, `Subscription` and HOCs
   * This is useful for further abstraction of some common tasks (eg. error handling).
   * Filepath relative to generated file can be also specified.
   * @default urql
   */
  urqlImportFrom?: string;
}
