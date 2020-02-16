import { RawResolversConfig } from '@graphql-codegen/visitor-plugin-common';

export interface TypeScriptResolversPluginConfig extends RawResolversConfig {
  /**
   * @name useIndexSignature
   * @type boolean
   * @description Adds an index signature to any generates resolver.
   * @default false
   *
   * @example
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
   * @name noSchemaStitching
   * @type boolean
   * @description Disables Schema Stitching support
   * @default false
   * @warning The default behavior will be reversed in the next major release. Support for Schema Stitching will be disabled by default.
   *
   * @example
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
   * @name wrapFieldDefinitions
   * @type boolean
   * @description Set to `true` in order to wrap field definitions with `FieldWrapper`.
   * This is useful to allow return types such as Promises and functions. Needed for
   * compatibility with `federation: true` when
   * @default true
   *
   * @example Enable wrapping fields
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    wrapFieldDefinitions: false
   * ```
   */
  wrapFieldDefinitions?: boolean;
  /**
   * @name customResolveInfo
   * @type string
   * @description You can provide your custom GraphQLResolveInfo instead of the default one from graphql-js
   * @default "graphql#GraphQLResolveInfo"
   *
   * @example
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
}
