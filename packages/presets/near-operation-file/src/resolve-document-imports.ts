import { isUsingTypes, Types, DetailedError } from '@graphql-codegen/plugin-helpers';
import {
  generateImportStatement,
  ImportSource,
  resolveImportSource,
  FragmentImport,
  ImportDeclaration,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { FragmentDefinitionNode, GraphQLSchema } from 'graphql';
import buildFragmentResolver from './fragment-resolver.js';
import { Source } from '@graphql-tools/utils';

export type FragmentRegistry = {
  [fragmentName: string]: { location: string; importNames: string[]; onType: string; node: FragmentDefinitionNode };
};

export type DocumentImportResolverOptions = {
  baseDir: string;
  /**
   * Generates a target file path from the source `document.location`
   */
  generateFilePath: (location: string) => string;
  /**
   * Schema base types source
   */
  schemaTypesSource: string | ImportSource;
  /**
   * Should `import type` be used
   */
  typesImport: boolean;
};

interface ResolveDocumentImportResult {
  filename: string;
  documents: [Source];
  importStatements: string[];
  fragmentImports: ImportDeclaration<FragmentImport>[];
  externalFragments: LoadedFragment<{
    level: number;
  }>[];
}

/**
 * Transform the preset's provided documents into single-file generator sources, while resolving fragment and user-defined imports
 *
 * Resolves user provided imports and fragment imports using the `DocumentImportResolverOptions`.
 * Does not define specific plugins, but rather returns a string[] of `importStatements` for the calling plugin to make use of
 */
export function resolveDocumentImports<T>(
  presetOptions: Types.PresetFnArgs<T>,
  schemaObject: GraphQLSchema,
  importResolverOptions: DocumentImportResolverOptions,
  dedupeFragments = false
): Array<ResolveDocumentImportResult> {
  const resolveFragments = buildFragmentResolver(importResolverOptions, presetOptions, schemaObject, dedupeFragments);
  const { baseOutputDir, documents } = presetOptions;
  const { generateFilePath, schemaTypesSource, baseDir, typesImport } = importResolverOptions;

  return documents.map(documentFile => {
    try {
      const generatedFilePath = generateFilePath(documentFile.location);
      const importStatements: string[] = [];
      const { externalFragments, fragmentImports } = resolveFragments(generatedFilePath, documentFile.document);

      const externalFragmentsInjectedDocument = {
        ...documentFile.document,
        definitions: [...documentFile.document.definitions, ...externalFragments.map(fragment => fragment.node)],
      };

      if (isUsingTypes(externalFragmentsInjectedDocument, [], schemaObject)) {
        const schemaTypesImportStatement = generateImportStatement({
          baseDir,
          emitLegacyCommonJSImports: presetOptions.config.emitLegacyCommonJSImports,
          importSource: resolveImportSource(schemaTypesSource),
          baseOutputDir,
          outputPath: generatedFilePath,
          typesImport,
        });
        importStatements.unshift(schemaTypesImportStatement);
      }

      return {
        filename: generatedFilePath,
        documents: [documentFile],
        importStatements,
        fragmentImports,
        externalFragments,
      };
    } catch (e) {
      throw new DetailedError(
        `Unable to validate GraphQL document!`,
        `
  File ${documentFile.location} caused error:
    ${e.message || e.toString()}
        `,
        documentFile.location
      );
    }
  });
}
