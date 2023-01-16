import * as addPlugin from '@graphql-codegen/add';
import * as gqlTagPlugin from '@graphql-codegen/gql-tag-operations';
import type { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import * as typedDocumentNodePlugin from '@graphql-codegen/typed-document-node';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import * as typescriptOperationPlugin from '@graphql-codegen/typescript-operations';
import { ClientSideBaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { DocumentNode } from 'graphql';
import babelOptimizerPlugin from './babel.js';
import * as fragmentMaskingPlugin from './fragment-masking-plugin.js';
import { generateDocumentHash, normalizeAndPrintDocumentNode } from './persisted-documents.js';
import { processSources } from './process-sources.js';

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
  onDocumentNode?: (documentNode: DocumentNode) => void | Record<string, unknown>;
  /** Persisted operations configuration. */
  persistedOperations?:
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

    // eslint-disable-next-line no-implicit-coercion
    const isPersistedOperations = !!options.presetConfig?.persistedOperations ?? false;

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
    };

    const visitor = new ClientSideBaseVisitor(options.schemaAst!, [], options.config, options.config);
    let fragmentMaskingConfig: FragmentMaskingConfig | null = null;

    if (typeof options?.presetConfig?.fragmentMasking === 'object') {
      fragmentMaskingConfig = options.presetConfig.fragmentMasking;
    } else if (options?.presetConfig?.fragmentMasking !== false) {
      // `true` by default
      fragmentMaskingConfig = {};
    }

    const onDocumentNodeHook = options.presetConfig.onDocumentNode ?? null;
    const isMaskingFragments = fragmentMaskingConfig != null;

    const persistedOperations = options.presetConfig.persistedOperations
      ? {
          hashPropertyName:
            (typeof options.presetConfig.persistedOperations === 'object' &&
              options.presetConfig.persistedOperations.hashPropertyName) ||
            'hash',
          omitDefinitions:
            (typeof options.presetConfig.persistedOperations === 'object' &&
              options.presetConfig.persistedOperations.mode) === 'replaceDocumentWithHash' || false,
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
    const persistedOperationsMap = new Map<string, string>();

    const pluginMap = {
      ...options.pluginMap,
      [`add`]: addPlugin,
      [`typescript`]: typescriptPlugin,
      [`typescript-operations`]: typescriptOperationPlugin,
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

    function onDocumentNode(documentNode: DocumentNode) {
      const meta = onDocumentNodeHook?.(documentNode);
      if (persistedOperations) {
        const documentString = normalizeAndPrintDocumentNode(documentNode);
        const hash = generateDocumentHash(documentString);
        persistedOperationsMap.set(hash, documentString);
        return { ...meta, [persistedOperations.hashPropertyName]: hash };
      }

      if (meta) {
        return meta;
      }

      return undefined;
    }

    const plugins: Array<Types.ConfiguredPlugin> = [
      { [`add`]: { content: `/* eslint-disable */` } },
      { [`typescript`]: {} },
      { [`typescript-operations`]: {} },
      {
        [`typed-document-node`]: {
          unstable_onDocumentNode: onDocumentNode,
          unstable_omitDefinitions: persistedOperations?.omitDefinitions ?? false,
        },
      },
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
              content: reexports.map(moduleName => `export * from "./${moduleName}${reexportsExtension}";`).join('\n'),
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
        filename: `${options.baseOutputDir}graphql.ts`,
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
        filename: `${options.baseOutputDir}gql${gqlArtifactFileExtension}`,
        plugins: genDtsPlugins,
        pluginMap,
        schema: options.schema,
        config: {
          ...config,
          gqlTagName: options.presetConfig.gqlTagName || 'graphql',
        },
        documents: sources,
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
                      content: JSON.stringify(Object.fromEntries(persistedOperationsMap.entries()), null, 2),
                    };
                  },
                },
              },
              schema: options.schema,
              config: {},
              documents: sources,
            },
          ]
        : []),
      ...(fragmentMaskingFileGenerateConfig ? [fragmentMaskingFileGenerateConfig] : []),
      ...(indexFileGenerateConfig ? [indexFileGenerateConfig] : []),
    ];
  },
};

export { babelOptimizerPlugin };

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
