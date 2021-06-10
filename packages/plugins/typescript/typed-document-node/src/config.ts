import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface TypeScriptTypedDocumentNodesConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
   * @default false
   *
   * @exampleMarkdown
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
  /**
   * @description  Removes fragment duplicants for reducing data transfer.
   * It is done by removing sub-fragments imports from fragment definition
   * Instead - import all of them are imported to the Operation node.
   * @default false
   */
  dedupeFragments?: boolean;
}
