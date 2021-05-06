import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates functions with TypeScript typings using Svelte context.
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 *
 */
export interface SvelteApolloVisitorConfig extends RawClientSideBasePluginConfig {
  /**
   * @name addSvelteContext
   * @description Generates a custom Svelte context for Apollo Client.
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-svelte-apollo
   *  config:
   *    addSvelteContext: true
   * ```
   */
  addSvelteContext?: boolean;
  /**
   * @name loadGetClientFrom
   * @description Overrides the path from where getClient is load. The function returns ApolloClient instance. The parameter is ignored when addSvelteContext is true. Compatible with Svelte-Apollo package (from Microsoft).
   * @default svelte-apollo
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-svelte-apollo
   *  config:
   *    loadGetClientFrom: ./client
   * ```
   */
  loadGetClientFrom?: string;
}
