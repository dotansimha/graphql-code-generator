import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

export interface PythonPluginConfig extends RawTypesConfig {
  /**
   * @name immutableTypes
   * @type boolean
   * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    immutableTypes: true
   * ```
   */
  immutableTypes?: boolean;
}
