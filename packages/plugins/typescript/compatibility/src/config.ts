import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
export interface CompatabilityPluginRawConfig extends RawConfig {
  /**
   * @name noNamespaces
   * @type boolean
   * @description Does not generate TypeScript `namepsace`s and uses the operation name as prefix.
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
   * @type boolean
   * @description Make sure to genereate code that compatible with TypeScript strict mode.
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
   * @type boolean
   * @description Avoid using `Pick` in `typescript-operations` and make sure to optimize this package as well.
   * @default false
   *
   */
  preResolveTypes?: boolean;
}
