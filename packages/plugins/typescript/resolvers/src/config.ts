import { RawResolversConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates TypeScript signature for `resolve` functions of your GraphQL API.
 * You can use this plugin to generate simple resolvers signature based on your GraphQL types, or you can change its behavior be providing custom model types (mappers).
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
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers'],
   *        config: {
   *          useIndexSignature: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  useIndexSignature?: boolean;
  /**
   * @description Disables/Enables Schema Stitching support.
   * By default, the resolver signature does not include the support for schema-stitching.
   * Set to `false` to enable that.
   *
   * @default true
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers'],
   *        config: {
   *          noSchemaStitching: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
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
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers'],
   *        config: {
   *          customResolveInfo: './my-types#MyResolveInfo'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  customResolveInfo?: string;
  /**
   * @description You can provide your custom ResolveFn instead the default. It has to be a type that uses the generics `<TResult, TParent, TContext, TArgs>`
   * @default "(parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult"
   *
   * @exampleMarkdown
   * ## Custom Signature
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers'],
   *        config: {
   *          customResolverFn: './my-types#MyResolveFn'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## With Graphile
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers'],
   *        config: {
   *          customResolverFn: './my-types#MyResolveFn'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      "path/to/file.ts": {
   *        "plugins": [
   *            {
   *                "add": {
   *                    "content": "import { GraphileHelpers } from 'graphile-utils/node8plus/fieldHelpers';"
   *                }
   *            },
   *            "typescript",
   *            "typescript-resolvers"
   *        ],
   *        "config": {
   *            "customResolverFn": "(\n  parent: TParent,\n  args: TArgs,\n  context: TContext,\n  info: GraphQLResolveInfo & { graphile: GraphileHelpers<TParent> }\n) => Promise<TResult> | TResult;\n"
   *        }
   *      }
   *    }
   *  };
   *  export default config;
   * ```
   *
   */
  customResolverFn?: string;
  /**
   * @description Map the usage of a directive into using a specific resolver.
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers'],
   *        config: {
   *          customResolverFn: '../resolver-types.ts#UnauthenticatedResolver',
   *          directiveResolverMappings: {
   *            authenticated: '../resolvers-types.ts#AuthenticatedResolver',
   *          },
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  directiveResolverMappings?: Record<string, string>;
  /**
   * @description Allow you to override the `ParentType` generic in each resolver, by avoid enforcing the base type of the generated generic type.
   *
   * This will generate `ParentType = Type` instead of `ParentType extends Type = Type` in each resolver.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers'],
   *        config: {
   *          allowParentTypeOverride: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   */
  allowParentTypeOverride?: boolean;
  /**
   * @description Sets `info` argument of resolver function to be optional field. Useful for testing.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers'],
   *        config: {
   *          optionalInfoArgument: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   */
  optionalInfoArgument?: boolean;
  /**
   * @description Set to `true` in order to allow the Resolver type to be callable
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers'],
   *        config: {
   *          makeResolverTypeCallable: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  makeResolverTypeCallable?: boolean;
}
