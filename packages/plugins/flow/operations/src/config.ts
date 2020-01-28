import { RawDocumentsConfig } from '@graphql-codegen/visitor-plugin-common';

export interface FlowDocumentsPluginConfig extends RawDocumentsConfig {
  /**
   * @name useFlowExactObjects
   * @type boolean
   * @description Generates Flow types as Exact types.
   * @default true
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - flow
   *  config:
   *    useFlowExactObjects: false
   * ```
   */
  useFlowExactObjects?: boolean;
  /**
   * @name useFlowReadOnlyTypes
   * @type boolean
   * @description Generates read-only Flow types
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - flow
   *  config:
   *    useFlowReadOnlyTypes: true
   * ```
   */
  useFlowReadOnlyTypes?: boolean;
  /**
   * @name flattenGeneratedTypes
   * @type boolean
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *  config:
   *    flattenGeneratedTypes: true
   * ```
   */
  flattenGeneratedTypes?: boolean;
}
