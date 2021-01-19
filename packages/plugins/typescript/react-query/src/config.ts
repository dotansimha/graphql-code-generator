import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export type HardcodedFetch = { endpoint: string; fetchParams?: Record<string, any> };

/**
 * @description This plugin generates `React-Query` Hooks with TypeScript typings.
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 */
export interface ReactQueryRawPluginConfig
  extends Omit<
    RawClientSideBasePluginConfig,
    | 'documentMode'
    | 'noGraphQLTag'
    | 'gqlImport'
    | 'documentNodeImport'
    | 'noExport'
    | 'importOperationTypesFrom'
    | 'importDocumentNodeExternallyFrom'
    | 'useTypeImports'
  > {
  /**
   * @description Customize the fetcher you wish to use in the generated file. React-Query is agnostic to the data-fetcing layer, so you should provide it, or use a custom one.
   *
   * The following options are available to use:
   * - 'fetch' - requires you to specify endpoint and headers on each call, and uses `fetch` to do the actual http call.
   * - `{ endpoint: string, fetchParams: RequestInit }`: hardcode your endpoint and fetch options into the generated output, using the environment `fetch` method. You can also use `process.env.MY_VAR` as endpoint or header value.
   * - `file#identifier` - You can use custom fetcher method that should implement the exported `ReactQueryFetcher` interface. Example: `./my-fetcher#myCustomFetcher`.
   * - `graphql-request`: Will generate each hook with `client` argument, where you should pass your own `GraphQLClient` (created from `graphql-request`).
   */
  fetcher: 'fetch' | HardcodedFetch | 'graphql-request' | string;

  /**
   * @default false
   * @description For each generate query hook adds getKey(variables: QueryVariables) function. Useful for cache updates. Example:
   * const query = useUserDetailsQuery(...);
   * const key = useUserDetailsQuery.getKey({id: theUsersId});
   * // use key in a cache update after a mutation
   */
  exposeQueryKeys?: boolean;
}
