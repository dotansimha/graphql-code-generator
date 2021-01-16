import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates `urql` (https://github.com/FormidableLabs/urql) Svelte stores and HOSs (higher order stores) with TypeScript typings.
 */
export interface UrqlSvelteRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description You can specify module that exports components `Query`, `Mutation`, `Subscription` and HOCs
   * This is useful for further abstraction of some common tasks (eg. error handling).
   * Filepath relative to generated file can be also specified.
   * @default @urql/svelte
   */
  urqlSvelteImportFrom?: string;
}
