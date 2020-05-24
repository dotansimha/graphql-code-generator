import { RawDocumentsConfig } from '@graphql-codegen/visitor-plugin-common';

export interface FlowDocumentsPluginConfig extends RawDocumentsConfig {
  /**
   * @description Generates Flow types as Exact types.
   * @default true
   *
   * @examples
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
   * @description Generates read-only Flow types
   * @default false
   *
   * @examples
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
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
   * @default false
   *
   * @examples
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
