import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates `urql` (https://github.com/FormidableLabs/urql) components and HOC with TypeScript typings.
 */
export interface UrqlRawPluginConfig extends RawClientSideBasePluginConfig {
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
   * This is useful for further abstraction of some common tasks (e.g. error handling).
   * Filepath relative to generated file can be also specified.
   * @default urql
   */
  urqlImportFrom?: string;
}
