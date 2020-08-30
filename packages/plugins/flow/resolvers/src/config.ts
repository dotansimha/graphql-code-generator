import { RawResolversConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates Flow signature for `resolve` functions of your GraphQL API.
 * You can use this plugin a to generate simple resolvers signature based on your GraphQL types, or you can change it's behavior be providing custom model types (mappers).
 *
 */
export interface FlowResolversPluginConfig extends RawResolversConfig {
  /**
   * @description You can provide your custom ResolveFn instead the default.
   * @default "(parent: Parent, args: Args, context: Context, info: GraphQLResolveInfo) => Promise<Result> | Result"
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - flow
   *    - flow-resolvers
   *  config:
   *    customResolverFn: |
   *      (
   *        args: Args,
   *        context: Context,
   *        info: GraphQLResolveInfo
   *      ) => Promise<Result> | Result;
   * ```
   */
  customResolverFn?: string;
  /**
   * @description You can define read only resolvers.
   * @default false
   */
  resolverReadOnly?: boolean;
}
