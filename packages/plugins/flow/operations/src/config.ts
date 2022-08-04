import { RawDocumentsConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates Flow types based on your `GraphQLSchema` and your GraphQL operations and fragments.
 *
 * It generates types for your GraphQL documents: Query, Mutation, Subscription and Fragment.
 *
 * This plugin requires you to use `@graphql-codegen/flow` as well, because it depends on its types.
 */
export interface FlowDocumentsPluginConfig extends RawDocumentsConfig {
  /**
   * @description Generates Flow types as Exact types.
   * @default true
   *
   * @exampleMarkdown
   * ```yaml {6}
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
   * @exampleMarkdown
   * ```yaml {6}
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - flow
   *     config:
   *       useFlowReadOnlyTypes: true
   * ```
   */
  useFlowReadOnlyTypes?: boolean;
  /**
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
   * @default false
   *
   * @exampleMarkdown
   * ```yaml {7}
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
}
