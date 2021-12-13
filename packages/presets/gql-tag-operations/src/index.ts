import * as addPlugin from '@graphql-codegen/add';
import { Types } from '@graphql-codegen/plugin-helpers';
import * as typedDocumentNodePlugin from '@graphql-codegen/typed-document-node';
import * as typescriptOperationPlugin from '@graphql-codegen/typescript-operations';
import * as typescriptPlugin from '@graphql-codegen/typescript';

import * as gqlTagPlugin from '@graphql-codegen/gql-tag-operations';
import { processSources } from './process-sources';
import { ClientSideBaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import babelPlugin from './babel';

export type GqlTagConfig = {
  /**
   * @description Instead of generating a `gql` function, this preset can also generate a `d.ts` that will enhance the `gql` function of your framework.
   *
   * E.g. `graphql-tag` or `@urql/core`.
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   gql/:
   *     preset: gql-tag-operations-preset
   *     presetConfig:
   *       augmentedModuleName: '@urql/core'
   * ```
   */
  augmentedModuleName?: string;
};

export const preset: Types.OutputPreset<GqlTagConfig> = {
  buildGeneratesSection: options => {
    const visitor = new ClientSideBaseVisitor(options.schemaAst!, [], options.config, options.config);
    const sourcesWithOperations = processSources(options.documents, node => {
      if (node.kind === 'FragmentDefinition') {
        return visitor.getFragmentVariableName(node);
      }
      return visitor.getOperationVariableName(node);
    });
    const sources = sourcesWithOperations.map(({ source }) => source);

    const pluginMap = {
      ...options.pluginMap,
      [`add`]: addPlugin,
      [`typescript`]: typescriptPlugin,
      [`typescript-operations`]: typescriptOperationPlugin,
      [`typed-document-node`]: typedDocumentNodePlugin,
      [`gen-dts`]: gqlTagPlugin,
    };

    const plugins: Array<Types.ConfiguredPlugin> = [
      { [`add`]: { content: `/* eslint-disable */` } },
      { [`typescript`]: {} },
      { [`typescript-operations`]: {} },
      { [`typed-document-node`]: {} },
      ...options.plugins,
    ];

    const genDtsPlugins: Array<Types.ConfiguredPlugin> = [
      { [`add`]: { content: `/* eslint-disable */` } },
      { [`gen-dts`]: { sourcesWithOperations } },
    ];

    const artifactFileExtension = options.presetConfig.augmentedModuleName == null ? `ts` : `d.ts`;

    return [
      {
        filename: `${options.baseOutputDir}/graphql.ts`,
        plugins,
        pluginMap,
        schema: options.schema,
        config: options.config,
        documents: sources,
      },
      {
        filename: `${options.baseOutputDir}/index.${artifactFileExtension}`,
        plugins: genDtsPlugins,
        pluginMap,
        schema: options.schema,
        config: {
          ...options.config,
          augmentedModuleName: options.presetConfig.augmentedModuleName,
        },
        documents: sources,
      },
    ];
  },
};

export { babelPlugin };
