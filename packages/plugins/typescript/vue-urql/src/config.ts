import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates `urql` (https://github.com/FormidableLabs/urql) composition functions with TypeScript typings.
 */
export interface VueUrqlRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Customized the output by enabling/disabling the generated Vue Composition functions.
   * @default true
   *
   */
  withComposition?: boolean;
  /**
   * @description You can specify module that exports components `Query`, `Mutation`, `Subscription`
   * This is useful for further abstraction of some common tasks (e.g. error handling).
   * Filepath relative to generated file can be also specified.
   * @default urql
   */
  urqlImportFrom?: string;
}
