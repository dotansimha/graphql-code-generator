import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface TypeScriptTypedDocumentNodesConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-operations'],
   *        config: {
   *          flattenGeneratedTypes: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  flattenGeneratedTypes?: boolean;

  /**
   * @description Add __typename to selection set
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-operations'],
   *        config: {
   *          addTypenameToSelectionSets: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  addTypenameToSelectionSets?: boolean;

  /**
   * @description Allows you to import the operation types from a different file.
   * @default ""
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-operations']
   *      },
   *      'path/to/file2.ts': {
   *        plugins: ['typed-document-node'],
   *        config: {
   *          importOperationTypesFrom: 'path/to/file.ts'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  importOperationTypesFrom?: string;
}
