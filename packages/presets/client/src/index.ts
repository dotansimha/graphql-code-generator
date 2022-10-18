import * as addPlugin from '@graphql-codegen/add';
import type { Types } from '@graphql-codegen/plugin-helpers';
import * as typedDocumentNodePlugin from '@graphql-codegen/typed-document-node';
import * as typescriptOperationPlugin from '@graphql-codegen/typescript-operations';
import * as typescriptPlugin from '@graphql-codegen/typescript';

import * as gqlTagPlugin from '@graphql-codegen/gql-tag-operations';
import { processSources } from './process-sources.js';
import { ClientSideBaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import babelOptimizerPlugin from './babel.js';
import * as fragmentMaskingPlugin from './fragment-masking-plugin.js';
import { isOutputFolder } from './isOutputFolder.js';

export type FragmentMaskingConfig = {
  /** @description Name of the function that should be used for unmasking a masked fragment property.
   * @default `'useFragment'`
   */
  unmaskFunctionName?: string;
};

export type ClientPresetConfig = {
  /**
   * @description Fragment masking hides data from components and only allows accessing the data by using a unmasking function.
   * @exampleMarkdown
   * ```tsx
   * const config = {
   *    schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
   *    documents: ['src/**\/*.tsx', '!src\/gql/**\/*'],
   *    generates: {
   *       './src/gql/': {
   *          preset: 'front-end',
   *          presetConfig: {
   *            fragmentMasking: false,
   *          }
   *        },
   *    },
   * };
   * export default config;
   * ```
   */
  fragmentMasking?: FragmentMaskingConfig | boolean;
  /**
   * @description Specify the name of the "graphql tag" function to use
   * @default "graphql"
   *
   * E.g. `graphql` or `gql`.
   *
   * @exampleMarkdown
   * ```tsx
   * const config = {
   *    schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
   *    documents: ['src/**\/*.tsx', '!src\/gql/**\/*'],
   *    generates: {
   *       './src/gql/': {
   *          preset: 'front-end',
   *          presetConfig: {
   *            gqlTagName: 'gql',
   *          }
   *        },
   *    },
   * };
   * export default config;
   * ```
   */
  gqlTagName?: string;
};

export const preset: Types.OutputPreset<ClientPresetConfig> = {
  prepareDocuments: (outputFilePath, outputSpecificDocuments) => [...outputSpecificDocuments, `!${outputFilePath}`],
  buildGeneratesSection: options => {
    if (!isOutputFolder(options.baseOutputDir)) {
      throw new Error('[client-preset] target output should be a directory');
    }

    if (options.plugins.length > 0) {
      throw new Error('[client-preset] providing `plugins` with `preset: "client" leads to duplicated generated types');
    }

    const reexports: Array<string> = [];

    // the `client` preset is restricting the config options inherited from `typescript`, `typescript-operations` and others.
    const forwardedConfig = {
      scalars: options.config.scalars,
      defaultScalarType: options.config.defaultScalarType,
      strictScalars: options.config.strictScalars,
      namingConvention: options.config.namingConvention,
      useTypeImports: options.config.useTypeImports,
      skipTypename: options.config.skipTypename,
      arrayInputCoercion: options.config.arrayInputCoercion,
      enumsAsTypes: options.config.enumsAsTypes,
    };

    const visitor = new ClientSideBaseVisitor(options.schemaAst!, [], options.config, options.config);
    let fragmentMaskingConfig: FragmentMaskingConfig | null = null;

    if (typeof options?.presetConfig?.fragmentMasking === 'object') {
      fragmentMaskingConfig = options.presetConfig.fragmentMasking;
    } else if (options?.presetConfig?.fragmentMasking !== false) {
      // `true` by default
      fragmentMaskingConfig = {};
    }

    const isMaskingFragments = fragmentMaskingConfig != null;

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

    const gqlArtifactFileExtension = '.ts';
    reexports.push('gql');

    const config = {
      ...options.config,
      inlineFragmentTypes: isMaskingFragments ? 'mask' : options.config['inlineFragmentTypes'],
    };

    let fragmentMaskingFileGenerateConfig: Types.GenerateOptions | null = null;

    if (isMaskingFragments === true) {
      const fragmentMaskingArtifactFileExtension = '.ts';

      reexports.push('fragment-masking');

      fragmentMaskingFileGenerateConfig = {
        filename: `${options.baseOutputDir}/fragment-masking${fragmentMaskingArtifactFileExtension}`,
        pluginMap: {
          [`fragment-masking`]: fragmentMaskingPlugin,
        },
        plugins: [
          {
            [`fragment-masking`]: {},
          },
        ],
        schema: options.schema,
        config: {
          useTypeImports: options.config.useTypeImports,
          unmaskFunctionName: fragmentMaskingConfig.unmaskFunctionName,
        },
        documents: [],
      };
    }

    let indexFileGenerateConfig: Types.GenerateOptions | null = null;

    const reexportsExtension = options.config.emitLegacyCommonJSImports ? '' : '.js';

    if (reexports.length) {
      indexFileGenerateConfig = {
        filename: `${options.baseOutputDir}/index.ts`,
        pluginMap: {
          [`add`]: addPlugin,
        },
        plugins: [
          {
            [`add`]: {
              content: reexports.map(moduleName => `export * from "./${moduleName}${reexportsExtension}"`).join('\n'),
            },
          },
        ],
        schema: options.schema,
        config: {},
        documents: [],
      };
    }

    return [
      {
        filename: `${options.baseOutputDir}/graphql.ts`,
        plugins,
        pluginMap,
        schema: options.schema,
        config: {
          inlineFragmentTypes: isMaskingFragments ? 'mask' : options.config['inlineFragmentTypes'],
          ...forwardedConfig,
        },
        documents: sources,
      },
      {
        filename: `${options.baseOutputDir}/gql${gqlArtifactFileExtension}`,
        plugins: genDtsPlugins,
        pluginMap,
        schema: options.schema,
        config: {
          ...config,
          gqlTagName: options.presetConfig.gqlTagName || 'graphql',
        },
        documents: sources,
      },
      ...(fragmentMaskingFileGenerateConfig ? [fragmentMaskingFileGenerateConfig] : []),
      ...(indexFileGenerateConfig ? [indexFileGenerateConfig] : []),
    ];
  },
};

export { babelOptimizerPlugin };
