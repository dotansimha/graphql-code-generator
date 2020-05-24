import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

export interface FlowPluginConfig extends RawTypesConfig {
  /**
   * @description Generates Flow types as Exact types.
   * @default true
   *
   * @examples
   * ```yml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - flow
   *     config:
   *       useFlowExactObjects: false
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
   *   path/to/file.ts:
   *    plugins:
   *      - flow
   *    config:
   *      useFlowReadOnlyTypes: true
   * ```
   */
  useFlowReadOnlyTypes?: boolean;
}
