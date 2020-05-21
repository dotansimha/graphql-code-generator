import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
export interface CompatibilityPluginRawConfig extends RawConfig {
  /**
   * @name noNamespaces
   * @description Does not generate TypeScript `namespace`s and uses the operation name as prefix.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-compatibility
   *  config:
   *    noNamespaces: true
   * ```
   */
  noNamespaces?: boolean;
  /**
   * @name strict
   * @description Make sure to generate code that compatible with TypeScript strict mode.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-compatibility
   *  config:
   *    strict: true
   * ```
   */
  strict?: boolean;
  /**
   * @name preResolveTypes
   * @description Avoid using `Pick` in `typescript-operations` and make sure to optimize this package as well.
   * @default false
   *
   */
  preResolveTypes?: boolean;
}
