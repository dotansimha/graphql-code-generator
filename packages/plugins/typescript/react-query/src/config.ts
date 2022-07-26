import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export type HardcodedFetch = { endpoint: string; fetchParams?: string | Record<string, any> };
export type CustomFetch = { func: string; isReactHook?: boolean } | string;

/**
 * @description This plugin generates `React-Query` Hooks with TypeScript typings.
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 *
 * > **If you are using the 'react-query' package instead of the `@tanstack/react-query` package in your project, please set the `legacyMode` option to `true`.**
 *
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
    | 'legacyMode'
  > {
  /**
   * @description Customize the fetcher you wish to use in the generated file. React-Query is agnostic to the data-fetching layer, so you should provide it, or use a custom one.
   *
   * The following options are available to use:
   *
   * - 'fetch' - requires you to specify endpoint and headers on each call, and uses `fetch` to do the actual http call.
   * - `{ endpoint: string, fetchParams: RequestInit }`: hardcode your endpoint and fetch options into the generated output, using the environment `fetch` method. You can also use `process.env.MY_VAR` as endpoint or header value.
   * - `file#identifier` - You can use custom fetcher method that should implement the exported `ReactQueryFetcher` interface. Example: `./my-fetcher#myCustomFetcher`.
   * - `graphql-request`: Will generate each hook with `client` argument, where you should pass your own `GraphQLClient` (created from `graphql-request`).
   */
  fetcher?: 'fetch' | HardcodedFetch | 'graphql-request' | CustomFetch;

  /**
   * @default false
   * @description For each generate query hook adds `document` field with a
   * corresponding GraphQL query. Useful for `queryClient.fetchQuery`.
   * @exampleMarkdown
   * ```ts
   * queryClient.fetchQuery(
   *   useUserDetailsQuery.getKey(variables),
   *   () => gqlRequest(useUserDetailsQuery.document, variables)
   * )
   * ```
   */
  exposeDocument?: boolean;

  /**
   * @default false
   * @description For each generate query hook adds getKey(variables: QueryVariables) function. Useful for cache updates. If addInfiniteQuery is true, it will also add a getKey function to each infinite query.
   * @exampleMarkdown
   * ```ts
   * const query = useUserDetailsQuery(...)
   * const key = useUserDetailsQuery.getKey({ id: theUsersId })
   * // use key in a cache update after a mutation
   * ```
   */
  exposeQueryKeys?: boolean;

  /**
   * @default false
   * @description For each generate mutation hook adds getKey() function. Useful for call outside of functional component.
   * @exampleMarkdown
   * ```ts
   * const mutation = useUserDetailsMutation(...)
   * const key = useUserDetailsMutation.getKey()
   * ```
   */
  exposeMutationKeys?: boolean;

  /**
   * @default false
   * @description For each generate query hook adds `fetcher` field with a corresponding GraphQL query using the fetcher.
   * It is useful for `queryClient.fetchQuery` and `queryClient.prefetchQuery`.
   * @exampleMarkdown
   * ```ts
   * await queryClient.prefetchQuery(userQuery.getKey(), () => userQuery.fetcher())
   * ```
   */
  exposeFetcher?: boolean;

  /**
   * @default unknown
   * @description Changes the default "TError" generic type.
   */
  errorType?: string;

  /**
   * @default false
   * @description Adds an Infinite Query along side the standard one
   */
  addInfiniteQuery?: boolean;

  /**
   * @default true
   * @description If false, it will work with `@tanstack/react-query`, default value is true.
   */
  legacyMode?: boolean;
}
