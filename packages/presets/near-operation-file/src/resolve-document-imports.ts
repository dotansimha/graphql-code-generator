import { isUsingTypes, Types } from '@graphql-codegen/plugin-helpers';
import { FragmentDefinitionNode, GraphQLSchema } from 'graphql';
import buildFragmentResolver from './fragment-resolver';

export type FragmentRegistry = { [fragmentName: string]: { filePath: string; importNames: string[]; onType: string; node: FragmentDefinitionNode } };

export type ImportSourceDefinition = {
  /**
   * Source path, relative to the `baseOutputDir`
   */
  path: string;
  /**
   * Namespace to import source as
   */
  namespace?: string;
  /**
   * Entity names to import
   */
  names?: string[];
};

function resolveImportSource(source: string | ImportSourceDefinition): ImportSourceDefinition {
  return typeof source === 'string' ? { path: source } : source;
}

type GenerateImportStatement = (paths: { relativeOutputPath: string; importSource: ImportSourceDefinition; baseOutputDir: string }) => string;

export type DocumentImportResolverOptions = {
  /**
   * Generates a target file path from the source `document.filePath`
   */
  generateFilePath: (filePath: string) => string;
  /**
   * String to append to all fragments
   */
  fragmentSuffix: string;
  /**
   *
   */
  generateImportStatement: GenerateImportStatement;
  /**
   *  Schema base types source
   */
  schemaTypesSource: string | ImportSourceDefinition;
};

/**
 * Transform the preset's provided documents into single-file generator sources, while resolving fragment and user-defined imports
 *
 * Resolves user provided imports and fragment imports using the `DocumentImportResolverOptions`.
 * Does not define specific plugins, but rather returns a string[] of `importStatements` for the calling plugin to make use of
 */
export default function resolveDocumentImportStatements<T>(presetOptions: Types.PresetFnArgs<T>, schemaObject: GraphQLSchema, importResolverOptions: DocumentImportResolverOptions) {
  const resolveFragments = buildFragmentResolver(importResolverOptions, presetOptions, schemaObject);

  const { baseOutputDir, documents } = presetOptions;
  const { generateFilePath, generateImportStatement, schemaTypesSource } = importResolverOptions;

  return documents.map(documentFile => {
    const generatedFilePath = generateFilePath(documentFile.filePath);

    const { externalFragments, fragmentImportStatements: importStatements } = resolveFragments(generatedFilePath, documentFile.content);

    if (
      isUsingTypes(
        documentFile.content,
        externalFragments.map(m => m.name),
        schemaObject
      )
    ) {
      const schemaTypesImportStatement = generateImportStatement({
        importSource: resolveImportSource(schemaTypesSource),
        baseOutputDir,
        relativeOutputPath: generatedFilePath,
      });
      importStatements.unshift(schemaTypesImportStatement);
    }

    return {
      filename: generatedFilePath,
      documents: [documentFile],
      importStatements,
      externalFragments,
    };
  });
}
