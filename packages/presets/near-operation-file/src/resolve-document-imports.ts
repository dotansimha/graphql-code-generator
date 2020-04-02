import { isUsingTypes, Types } from '@graphql-codegen/plugin-helpers';
import { generateImportStatement, ImportSource, resolveImportSource } from '@graphql-codegen/visitor-plugin-common';
import { FragmentDefinitionNode, GraphQLSchema } from 'graphql';
import buildFragmentResolver from './fragment-resolver';

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
   *  Schema base types source
   */
  schemaTypesSource: string | ImportSource;
};

/**
 * Transform the preset's provided documents into single-file generator sources, while resolving fragment and user-defined imports
 *
 * Resolves user provided imports and fragment imports using the `DocumentImportResolverOptions`.
 * Does not define specific plugins, but rather returns a string[] of `importStatements` for the calling plugin to make use of
 */
export function resolveDocumentImports<T>(
  presetOptions: Types.PresetFnArgs<T>,
  schemaObject: GraphQLSchema,
  importResolverOptions: DocumentImportResolverOptions
) {
  const resolveFragments = buildFragmentResolver(importResolverOptions, presetOptions, schemaObject);
  const { baseOutputDir, documents } = presetOptions;
  const { generateFilePath, schemaTypesSource, baseDir } = importResolverOptions;

  return documents.map(documentFile => {
    const generatedFilePath = generateFilePath(documentFile.location);
    const importStatements = [];
    const { externalFragments, fragmentImports } = resolveFragments(generatedFilePath, documentFile.document);

    if (
      isUsingTypes(
        documentFile.document,
        externalFragments.map(m => m.name),
        schemaObject
      )
    ) {
      const schemaTypesImportStatement = generateImportStatement({
        baseDir,
        importSource: resolveImportSource(schemaTypesSource),
        baseOutputDir,
        outputPath: generatedFilePath,
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
  });
}
