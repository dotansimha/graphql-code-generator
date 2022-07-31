import { RawDocumentsConfig, AvoidOptionalsConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates TypeScript types based on your GraphQLSchema _and_ your GraphQL operations and fragments.
 * It generates types for your GraphQL documents: Query, Mutation, Subscription and Fragment.
 *
 * Note: In most configurations, this plugin requires you to use `typescript as well, because it depends on its base types.
 */
export interface TypeScriptDocumentsPluginConfig extends RawDocumentsConfig {
  /**
   * @description The [GraphQL spec](https://spec.graphql.org/draft/#sel-FAHjBJFCAACE_Gh7d)
   * allows arrays and a single primitive value for list input. This allows to
   * deactivate that behavior to only accept arrays instead of single values. If
   * set to `false`, the definition: `query foo(bar: [Int!]!): Foo` will output
   * `bar: Array<Int>` instead of `bar: Array<Int> | Int` for the variable part.
   * @default true
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *     config:
   *       arrayInputCoercion: false
   * ```
   */
  arrayInputCoercion?: boolean;
  /**
   * @description This will cause the generator to avoid using TypeScript optionals (`?`) on types,
   * so the following definition: `type A { myField: String }` will output `myField: Maybe<string>`
   * instead of `myField?: Maybe<string>`.
   * @default false
   *
   * @exampleMarkdown
   * ## Override all definition types
   *
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *     config:
   *       avoidOptionals: true
   * ```
   *
   * ## Override only specific definition types
   *
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *     config:
   *       avoidOptionals:
   *         field: true
   *         inputValue: true
   *         object: true
   *         defaultValue: true
   * ```
   */
  avoidOptionals?: boolean | AvoidOptionalsConfig;
  /**
   * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *     config:
   *       immutableTypes: true
   * ```
   */
  immutableTypes?: boolean;
  /**
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *     config:
   *       flattenGeneratedTypes: true
   * ```
   */
  flattenGeneratedTypes?: boolean;

  /**
   * @description Include all fragments types when flattenGeneratedTypes is enabled.
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *     config:
   *       flattenGeneratedTypes: true
   *       flattenGeneratedTypesIncludeFragments: true
   * ```
   */
  flattenGeneratedTypesIncludeFragments?: boolean;

  /**
   * @description Set to `true` in order to generate output without `export` modifier.
   * This is useful if you are generating `.d.ts` file and want it to be globally available.
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *     config:
   *       noExport: true
   * ```
   */
  noExport?: boolean;
  globalNamespace?: boolean;
  /**
   * @name addOperationExport
   * @type boolean
   * @description Add const export of the operation name to output file. Pay attention that the file should be `d.ts`.
   * You can combine it with `near-operation-file preset` and therefore the types will be generated along with graphql file. Then you need to set extension in `presetConfig` to be `.gql.d.ts` and by that you can import `gql` file in `ts` files.
   * It will allow you to get everything with one import:
   *
   * ```ts
   * import { GetClient, GetClientQuery, GetClientQueryVariables } from './GetClient.gql.js'
   * ```
   * @default false
   * @see https://github.com/dotansimha/graphql-code-generator/issues/3949
   *
   * @example
   * ```yaml
   * generates:
   * ./typings/api.ts:
   *   plugins:
   *     - '@graphql-codegen/typescript'
   * ./:
   *   preset: near-operation-file
   *   presetConfig:
   *     baseTypesPath: ./typings/api.ts
   *     extension: .gql.d.ts
   *   plugins:
   *     - '@graphql-codegen/typescript-operations'
   *   config:
   *     addOperationExport: true
   * ```
   */
  addOperationExport?: boolean;
  /**
   * @description Allow to override the type value of `Maybe`.
   * @default T | null
   *
   * @exampleMarkdown
   * ## Allow undefined
   * ```yaml
   * generates:
   *  path/to/file.ts:
   *    plugins:
   *      - typescript
   *    config:
   *      maybeValue: T | null | undefined
   * ```
   *
   * ## Allow `null` in resolvers:
   * ```yaml
   * generates:
   *  path/to/file.ts:
   *    plugins:
   *      - typescript
   *      - typescript-resolvers
   *    config:
   *      maybeValue: 'T extends PromiseLike<infer U> ? Promise<U | null> : T | null'
   * ```
   */
  maybeValue?: string;
  /**
   * @description Change a field's type based on applied directives
   *
   * You can use both `module#type` and `module#namespace#type` syntax. Requires `preResolveTypes=true` and only works on FIELD directives.
   *
   * **WARNING:** Using this option only changes the type definitions.
   *
   * For actually ensuring that a type is correct at runtime you will have to use client or server-side transforms that apply those rules!
   * Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.
   *
   * Please use this configuration option with care!
   *
   * @exampleMarkdown
   * ## Directive field mappings
   * ```yml
   * plugins:
   *   config:
   *     # You cannot control optional(`?`) with `directiveFieldMapping`.
   *     # Setting `avoidOptionals` is recommended when defining directives that change nullability, such as `@nonNull` or `@required`.
   *     avoidOptionals:
   *       field: true  #
   *     directiveFieldMappings:
   *       asString: string
   *       nonNull: NonNullable
   *       nonNullEntries:
   *         type: NonNullable
   *         entries: true
   * ```
   * ## Schema with custom directives
   * ```graphqls
   * directive @asString on FIELD
   * directive @nonNull on FIELD
   * directive @nonNullEntries on FIELD
   *
   * type User {
   *   id: Int
   *   username: String
   *   emails: [String]
   * }
   *
   * ...
   * ```
   * ## Query that uses the custom directives
   * ```graphql
   * query {
   *   me {
   *     id @asString @nonNull
   *     username @nonNull
   *     emails @nonNullEntries
   *   }
   * }
   * ```
   */
  directiveFieldMappings?: {
    [name: string]:
      | string
      | {
          /** Wrapper type (e.g. `NonNullable`, `./module#type`, `./module#namespace#type`) */
          type: string;
          /** Wrap list entry type with type type specified by `type` */
          entries?: boolean;
        };
  };
}
