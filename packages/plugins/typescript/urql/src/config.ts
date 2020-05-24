import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface UrqlRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Customized the output by enabling/disabling the generated Component.
   * @default true
   */
  withComponent?: boolean;
  /**
   * @description Customized the output by enabling/disabling the generated React Hooks.
   * @default false
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
