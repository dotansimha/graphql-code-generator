import { Types, CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import type { Source } from '@graphql-tools/utils';
import addPlugin from '@graphql-codegen/add';
import { join } from 'path';
import { FragmentDefinitionNode, buildASTSchema, GraphQLSchema, DocumentNode, Kind } from 'graphql';
import { appendExtensionToFilePath, defineFilepathSubfolder } from './utils.js';
import { resolveDocumentImports, DocumentImportResolverOptions } from './resolve-document-imports.js';
import {
  FragmentImport,
  getConfigValue,
  ImportDeclaration,
  ImportSource,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';

export { resolveDocumentImports, DocumentImportResolverOptions };

export type FragmentImportFromFn = (
  source: ImportSource<FragmentImport>,
  sourceFilePath: string
) => ImportSource<FragmentImport>;

export type NearOperationFileConfig = {
  /**
   * @description Required, should point to the base schema types file.
   * The key of the output is used a the base path for this file.
   *
   * If you wish to use an NPM package or a local workspace package, make sure to prefix the package name with `~`.
   *
   * @exampleMarkdown
   * ```yaml {5}
   * generates:
   *   src/:
   *     preset: near-operation-file
   *     presetConfig:
   *       baseTypesPath: types.ts
   *     plugins:
   *       - typescript-operations
   * ```
   */
  baseTypesPath: string;
  /**
   * @description Overrides all external fragments import types by using a specific file path or a package name.
   *
   * If you wish to use an NPM package or a local workspace package, make sure to prefix the package name with `~`.
   *
   * @exampleMarkdown
   * ```yaml {6}
   * generates:
   *   src/:
   *     preset: near-operation-file
   *     presetConfig:
   *       baseTypesPath: types.ts
   *       importAllFragmentsFrom: '~types'
   *     plugins:
   *       - typescript-operations
   * ```
   */
  importAllFragmentsFrom?: string | FragmentImportFromFn;
  /**
   * @description Optional, sets the extension for the generated files. Use this to override the extension if you are using plugins that requires a different type of extensions (such as `typescript-react-apollo`)
   * @default .generated.ts
   *
   * @exampleMarkdown
   * ```yaml {6}
   * generates:
   *   src/:
   *     preset: near-operation-file
   *     presetConfig:
   *       baseTypesPath: types.ts
   *       extension: .generated.tsx
   *     plugins:
   *       - typescript-operations
   *       - typescript-react-apollo
   * ```
   */
  extension?: string;
  /**
   * @description Optional, override the `cwd` of the execution. We are using `cwd` to figure out the imports between files. Use this if your execution path is not your project root directory.
   * @default process.cwd()
   *
   * @exampleMarkdown
   * ```yaml {6}
   * generates:
   *   src/:
   *     preset: near-operation-file
   *     presetConfig:
   *       baseTypesPath: types.ts
   *       cwd: /some/path
   *     plugins:
   *       - typescript-operations
   * ```
   */
  cwd?: string;
  /**
   * @description Optional, defines a folder, (Relative to the source files) where the generated files will be created.
   * @default ''
   *
   * @exampleMarkdown
   * ```yaml {6}
   * generates:
   *   src/:
   *     preset: near-operation-file
   *     presetConfig:
   *       baseTypesPath: types.ts
   *       folder: __generated__
   *     plugins:
   *       - typescript-operations
   * ```
   */
  folder?: string;
  /**
   * @description Optional, override the name of the import namespace used to import from the `baseTypesPath` file.
   * @default Types
   *
   * @exampleMarkdown
   * ```yaml {6}
   * generates:
   *   src/:
   *     preset: near-operation-file
   *     presetConfig:
   *       baseTypesPath: types.ts
   *       importTypesNamespace: SchemaTypes
   *     plugins:
   *       - typescript-operations
   * ```
   */
  importTypesNamespace?: string;
};

export type FragmentNameToFile = {
  [fragmentName: string]: { location: string; importsNames: string[]; onType: string; node: FragmentDefinitionNode };
};

export const preset: Types.OutputPreset<NearOperationFileConfig> = {
  buildGeneratesSection: options => {
    const schemaObject: GraphQLSchema = options.schemaAst
      ? options.schemaAst
      : buildASTSchema(options.schema, options.config as any);
    const baseDir = options.presetConfig.cwd || process.cwd();
    const extension = options.presetConfig.extension || '.generated.ts';
    const folder = options.presetConfig.folder || '';
    const importTypesNamespace = options.presetConfig.importTypesNamespace || 'Types';
    const importAllFragmentsFrom: FragmentImportFromFn | string | null =
      options.presetConfig.importAllFragmentsFrom || null;

    const { baseTypesPath } = options.presetConfig;

    if (!baseTypesPath) {
      throw new Error(
        `Preset "near-operation-file" requires you to specify "baseTypesPath" configuration and point it to your base types file (generated by "typescript" plugin)!`
      );
    }

    const shouldAbsolute = !baseTypesPath.startsWith('~');

    const pluginMap: { [name: string]: CodegenPlugin } = {
      ...options.pluginMap,
      add: addPlugin,
    };

    const sources = resolveDocumentImports(
      options,
      schemaObject,
      {
        baseDir,
        generateFilePath(location: string) {
          const newFilePath = defineFilepathSubfolder(location, folder);

          return appendExtensionToFilePath(newFilePath, extension);
        },
        schemaTypesSource: {
          path: shouldAbsolute ? join(options.baseOutputDir, baseTypesPath) : baseTypesPath,
          namespace: importTypesNamespace,
        },
        typesImport: options.config.useTypeImports ?? false,
      },
      getConfigValue(options.config.dedupeFragments, false)
    );

    const filePathsMap = new Map<
      string,
      {
        importStatements: Set<string>;
        documents: Array<Source>;
        externalFragments: Array<
          LoadedFragment<{
            level: number;
          }>
        >;
        fragmentImports: Array<ImportDeclaration<FragmentImport>>;
      }
    >();

    for (const source of sources) {
      let record = filePathsMap.get(source.filename);
      if (record === undefined) {
        record = {
          importStatements: new Set(),
          documents: [],
          externalFragments: [],
          fragmentImports: [],
        };
        filePathsMap.set(source.filename, record);
      }

      for (const importStatement of source.importStatements) {
        record.importStatements.add(importStatement);
      }
      record.documents.push(...source.documents);
      record.externalFragments.push(...source.externalFragments);
      record.fragmentImports.push(...source.fragmentImports);
    }

    const artifacts: Array<Types.GenerateOptions> = [];

    for (const [filename, record] of filePathsMap.entries()) {
      let fragmentImportsArr = record.fragmentImports;

      if (importAllFragmentsFrom) {
        fragmentImportsArr = record.fragmentImports.map<ImportDeclaration<FragmentImport>>(t => {
          const newImportSource: ImportSource<FragmentImport> =
            typeof importAllFragmentsFrom === 'string'
              ? { ...t.importSource, path: importAllFragmentsFrom }
              : importAllFragmentsFrom(t.importSource, filename);

          return {
            ...t,
            importSource: newImportSource || t.importSource,
          };
        });
      }

      const plugins = [
        // TODO/NOTE I made globalNamespace include schema types - is that correct?
        ...(options.config.globalNamespace
          ? []
          : Array.from(record.importStatements).map(importStatement => ({ add: { content: importStatement } }))),
        ...options.plugins,
      ];
      const config = {
        ...options.config,
        // This is set here in order to make sure the fragment spreads sub types
        // are exported from operations file
        exportFragmentSpreadSubTypes: true,
        namespacedImportName: importTypesNamespace,
        externalFragments: record.externalFragments,
        fragmentImports: fragmentImportsArr,
      };

      const document: DocumentNode = { kind: Kind.DOCUMENT, definitions: [] };
      const combinedSource: Source = {
        rawSDL: '',
        document,
        location: record.documents[0].location,
      };

      for (const source of record.documents) {
        combinedSource.rawSDL += source.rawSDL;
        (combinedSource.document.definitions as any).push(...source.document.definitions);
      }

      artifacts.push({
        filename,
        documents: [combinedSource],
        plugins,
        pluginMap,
        config,
        schema: options.schema,
        schemaAst: schemaObject,
      });
    }

    return artifacts;
  },
};

export default preset;
