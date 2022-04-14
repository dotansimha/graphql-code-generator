import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface TypeScriptTypedDocumentNodesConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
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
   * @description Add __typename to selection set
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript-operations
   *    - typed-document-node
   *  config:
   *    addTypenameToSelectionSets: true
   * ```
   */
  addTypenameToSelectionSets?: boolean;
}
