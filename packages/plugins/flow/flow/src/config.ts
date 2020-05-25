import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

export interface FlowPluginConfig extends RawTypesConfig {
  /**
   * @name useFlowExactObjects
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
}
