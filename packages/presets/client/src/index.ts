import * as addPlugin from '@graphql-codegen/add';
import * as gqlTagPlugin from '@graphql-codegen/gql-tag-operations';
import type { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import * as typedDocumentNodePlugin from '@graphql-codegen/typed-document-node';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import * as typescriptOperationPlugin from '@graphql-codegen/typescript-operations';
import { ClientSideBaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { DocumentNode } from 'graphql';
import * as fragmentMaskingPlugin from './fragment-masking-plugin.js';
import { generateDocumentHash, normalizeAndPrintDocumentNode } from './persisted-documents.js';
import { processSources } from './process-sources.js';

export { default as babelOptimizerPlugin } from './babel.js';

import * as typescriptASTPoweredPlugin from './typescript-ast-visitor';

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
   *          preset: 'client',
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
   *          preset: 'client',
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
  /**
   * Generate metadata for a executable document node and embed it in the emitted code.
   */
  onExecutableDocumentNode?: (documentNode: DocumentNode) => void | Record<string, unknown>;
  /** Persisted operations configuration. */
  persistedDocuments?:
    | boolean
    | {
        /**
         * @description Behavior for the output file.
         * @default 'embedHashInDocument'
         * "embedHashInDocument" will add a property within the `DocumentNode` with the hash of the operation.
         * "replaceDocumentWithHash" will fully drop the document definition.
         */
        mode?: 'embedHashInDocument' | 'replaceDocumentWithHash';
        /**
         * @description Name of the property that will be added to the `DocumentNode` with the hash of the operation.
         */
        hashPropertyName?: string;
      };
};

const isOutputFolderLike = (baseOutputDir: string) => baseOutputDir.endsWith('/');

export const preset: Types.OutputPreset<ClientPresetConfig> = {
  prepareDocuments: (outputFilePath, outputSpecificDocuments) => [...outputSpecificDocuments, `!${outputFilePath}`],
  buildGeneratesSection: options => {
    if (!isOutputFolderLike(options.baseOutputDir)) {
      throw new Error('[client-preset] target output should be a directory, ex: "src/gql/"');
    }

    if (options.plugins.length > 0 && Object.keys(options.plugins).some(p => p.startsWith('typescript'))) {
      throw new Error(
        '[client-preset] providing typescript-based `plugins` with `preset: "client" leads to duplicated generated types'
      );
    }

    const isPersistedOperations = !!options.presetConfig?.persistedDocuments ?? false;

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
      dedupeFragments: options.config.dedupeFragments,
      nonOptionalTypename: options.config.nonOptionalTypename,
      avoidOptionals: options.config.avoidOptionals,
      documentMode: options.config.documentMode,
    };

    const visitor = new ClientSideBaseVisitor(options.schemaAst!, [], options.config, options.config);
    let fragmentMaskingConfig: FragmentMaskingConfig | null = null;

    if (typeof options?.presetConfig?.fragmentMasking === 'object') {
      fragmentMaskingConfig = options.presetConfig.fragmentMasking;
    } else if (options?.presetConfig?.fragmentMasking !== false) {
      // `true` by default
      fragmentMaskingConfig = {};
    }

    const onExecutableDocumentNodeHook = options.presetConfig.onExecutableDocumentNode ?? null;
    const isMaskingFragments = fragmentMaskingConfig != null;

    const persistedDocuments = options.presetConfig.persistedDocuments
      ? {
          hashPropertyName:
            (typeof options.presetConfig.persistedDocuments === 'object' &&
              options.presetConfig.persistedDocuments.hashPropertyName) ||
            'hash',
          omitDefinitions:
            (typeof options.presetConfig.persistedDocuments === 'object' &&
              options.presetConfig.persistedDocuments.mode) === 'replaceDocumentWithHash' || false,
        }
      : null;

    const sourcesWithOperations = processSources(options.documents, node => {
      if (node.kind === 'FragmentDefinition') {
        return visitor.getFragmentVariableName(node);
      }
      return visitor.getOperationVariableName(node);
    });
    const sources = sourcesWithOperations.map(({ source }) => source);

    const tdnFinished = createDeferred();
    const persistedDocumentsMap = new Map<string, string>();

    const pluginMap = {
      ...options.pluginMap,
      [`add`]: addPlugin,
      // TODO: Remove this
      [`typescript`]: typescriptPlugin,
      [`typescript-operations`]: typescriptOperationPlugin,
      [`typescript-ast-client-preset-only`]: typescriptASTPoweredPlugin,
      // END TODO -----------------
      [`typed-document-node`]: {
        ...typedDocumentNodePlugin,
        plugin: async (...args: Parameters<PluginFunction>) => {
          try {
            return await typedDocumentNodePlugin.plugin(...args);
          } finally {
            tdnFinished.resolve();
          }
        },
      },
      [`gen-dts`]: gqlTagPlugin,
    };

    function onExecutableDocumentNode(documentNode: DocumentNode) {
      const meta = onExecutableDocumentNodeHook?.(documentNode);

      if (persistedDocuments) {
        const documentString = normalizeAndPrintDocumentNode(documentNode);
        const hash = generateDocumentHash(documentString);
        persistedDocumentsMap.set(hash, documentString);
        return { ...meta, [persistedDocuments.hashPropertyName]: hash };
      }

      if (meta) {
        return meta;
      }

      return undefined;
    }

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
        filename: `${options.baseOutputDir}fragment-masking${fragmentMaskingArtifactFileExtension}`,
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
        documentTransforms: options.documentTransforms,
      };
    }

    let indexFileGenerateConfig: Types.GenerateOptions | null = null;

    const reexportsExtension = options.config.emitLegacyCommonJSImports ? '' : '.js';

    if (reexports.length) {
      indexFileGenerateConfig = {
        filename: `${options.baseOutputDir}index.ts`,
        pluginMap: {
          [`add`]: addPlugin,
        },
        plugins: [
          {
            [`add`]: {
              content: reexports
                .sort()
                .map(moduleName => `export * from "./${moduleName}${reexportsExtension}";`)
                .join('\n'),
            },
          },
        ],
        schema: options.schema,
        config: {},
        documents: [],
        documentTransforms: options.documentTransforms,
      };
    }

    return [
      {
        filename: `${options.baseOutputDir}graphql.ts`,
        plugins: [
          { [`add`]: { content: `/* eslint-disable */` } },
          { [`typescript`]: {} },
          { [`typescript-operations`]: {} },
          { [`typescript-ast-client-preset-only`]: {} },
          {
            [`typed-document-node`]: {
              unstable_onExecutableDocumentNode: onExecutableDocumentNode,
              unstable_omitDefinitions: persistedDocuments?.omitDefinitions ?? false,
            },
          },
          ...options.plugins,
        ],
        pluginMap,
        schema: options.schema,
        config: {
          inlineFragmentTypes: isMaskingFragments ? 'mask' : options.config['inlineFragmentTypes'],
          ...forwardedConfig,
        },
        documents: sources,
        documentTransforms: options.documentTransforms,
      },
      {
        filename: `${options.baseOutputDir}gql${gqlArtifactFileExtension}`,
        plugins: genDtsPlugins,
        pluginMap,
        schema: options.schema,
        config: {
          ...config,
          gqlTagName: options.presetConfig.gqlTagName || 'graphql',
        },
        documents: sources,
        documentTransforms: options.documentTransforms,
      },
      ...(isPersistedOperations
        ? [
            {
              filename: `${options.baseOutputDir}persisted-documents.json`,
              plugins: [
                {
                  [`persisted-operations`]: {},
                },
              ],
              pluginMap: {
                [`persisted-operations`]: {
                  plugin: async () => {
                    await tdnFinished.promise;
                    return {
                      content: JSON.stringify(Object.fromEntries(persistedDocumentsMap.entries()), null, 2),
                    };
                  },
                },
              },
              schema: options.schema,
              config: {},
              documents: sources,
              documentTransforms: options.documentTransforms,
            },
          ]
        : []),
      ...(fragmentMaskingFileGenerateConfig ? [fragmentMaskingFileGenerateConfig] : []),
      ...(indexFileGenerateConfig ? [indexFileGenerateConfig] : []),
    ];
  },
};

type Deferred<T = void> = {
  resolve: (value: T) => void;
  reject: (value: unknown) => void;
  promise: Promise<T>;
};

function createDeferred<T = void>(): Deferred<T> {
  const d = {} as Deferred<T>;
  d.promise = new Promise<T>((resolve, reject) => {
    d.resolve = resolve;
    d.reject = reject;
  });
  return d;
}
