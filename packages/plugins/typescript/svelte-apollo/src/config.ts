import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates functions with TypeScript typings using Svelte context.
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 *
 */
export interface SvelteApolloVisitorConfig extends RawClientSideBasePluginConfig {
  /**
   * @name loadGetClientFrom
   * @description Overrides the path from where getClient is load. The function should return ApolloClient instance. Compatible with Svelte-Apollo package (from Microsoft).
   * @default svelte-apollo
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   * path/to/file.ts:
   *   plugins:
   *     - typescript
   *     - typescript-operations
   *     - typescript-svelte-apollo
   *   config:
   *     loadGetClientFrom: ./client
   * ```
   */
  loadGetClientFrom?: string;
  /**
   * @name exportOnlyFunctions
   * @description If true, the generated file exports only functions (getClient, setClient, queries, mutations, subscriptions). The graphql documents, data types, input and output formats are not exported.
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   * path/to/file.ts:
   *   plugins:
   *     - typescript
   *     - typescript-operations
   *     - typescript-svelte-apollo
   *   config:
   *     exportOnlyFunctions: true
   * ```
   */
  exportOnlyFunctions?: boolean;
}
