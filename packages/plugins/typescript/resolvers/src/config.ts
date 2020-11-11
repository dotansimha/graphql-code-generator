import { RawResolversConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates TypeScript signature for `resolve` functions of your GraphQL API.
 * You can use this plugin a to generate simple resolvers signature based on your GraphQL types, or you can change it's behavior be providing custom model types (mappers).
 *
 * You can find a blog post explaining the usage of this plugin here: https://the-guild.dev/blog/better-type-safety-for-resolvers-with-graphql-codegen
 *
 */
export interface TypeScriptResolversPluginConfig extends RawResolversConfig {
  /**
   * @description Adds an index signature to any generates resolver.
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-resolvers
   *  config:
   *    useIndexSignature: true
   * ```
   */
  useIndexSignature?: boolean;
  /**
   * @description Disables Schema Stitching support.
   *
   * Note: The default behavior will be reversed in the next major release. Support for Schema Stitching will be disabled by default.
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-resolvers
   *  config:
   *    noSchemaStitching: true
   * ```
   */
  noSchemaStitching?: boolean;
  /**
   * @description Set to `true` in order to wrap field definitions with `FieldWrapper`.
   * This is useful to allow return types such as Promises and functions. Needed for
   * compatibility with `federation: true` when
   * @default true
   */
  wrapFieldDefinitions?: boolean;
  /**
   * @description You can provide your custom GraphQLResolveInfo instead of the default one from graphql-js
   * @default "graphql#GraphQLResolveInfo"
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-resolvers
   *  config:
   *    customResolveInfo: ./my-types#MyResolveInfo
   * ```
   */
  customResolveInfo?: string;
  /**
   * @description You can provide your custom ResolveFn instead the default. It has to be a type that uses the generics <TResult, TParent, TContext, TArgs>
   * @default "(parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult"
   *
   * @exampleMarkdown
   * ## Custom Signature
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-resolvers
   *  config:
   *    customResolverFn: ./my-types#MyResolveFn
   * ```
   *
   * ## With Graphile
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - add:
   *        content: "import { GraphileHelpers } from 'graphile-utils/node8plus/fieldHelpers';"
   *    - typescript
   *    - typescript-resolvers
   *  config:
   *    customResolverFn: |
   *      (
   *        parent: TParent,
   *        args: TArgs,
   *        context: TContext,
   *        info: GraphQLResolveInfo & { graphile: GraphileHelpers<TParent> }
   *      ) => Promise<TResult> | TResult;
   * ```
   */
  customResolverFn?: string;
  /**
   * @description Allow you to override the `ParentType` generic in each resolver, by avoid enforcing the base type of the generated generic type.
   *
   * This will generate `ParentType = Type` instead of `ParentType extends Type = Type` in each resolver.
   *
   * @exampleMarkdown
   * ```yml
   *   config:
   *     allowParentTypeOverride: true
   * ```
   *
   */
  allowParentTypeOverride?: boolean;
  /**
   * @description Sets `info` argument of resolver function to be optional field. Useful for testing.
   *
   * @exampleMarkdown
   * ```yml
   *   config:
   *     optionalInfoArgument: true
   * ```
   *
   */
  optionalInfoArgument?: boolean;
}
