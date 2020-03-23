import { RawDocumentsConfig } from '@graphql-codegen/visitor-plugin-common';

export interface PythonDocumentsPluginConfig extends RawDocumentsConfig {
  // /**
  //  * @name immutableTypes
  //  * @type boolean
  //  * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
  //  * @default false
  //  *
  //  * @example
  //  * ```yml
  //  * generates:
  //  * path/to/file.ts:
  //  *  plugins:
  //  *    - typescript
  //  *    - typescript-operations
  //  *  config:
  //  *    immutableTypes: true
  //  * ```
  //  */
  immutableTypes?: boolean;
  // /**
  //  * @name flattenGeneratedTypes
  //  * @type boolean
  //  * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
  //  * @default false
  //  *
  //  * @example
  //  * ```yml
  //  * generates:
  //  * path/to/file.ts:
  //  *  plugins:
  //  *    - typescript
  //  *    - typescript-operations
  //  *  config:
  //  *    flattenGeneratedTypes: true
  //  * ```
  //  */
  flattenGeneratedTypes?: boolean;
}
