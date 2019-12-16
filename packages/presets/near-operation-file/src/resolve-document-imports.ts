import { Types } from '@graphql-codegen/plugin-helpers';
import { FragmentDefinitionNode, GraphQLSchema } from 'graphql';
import buildFragmentResolver from './fragment-resolver';

export type FragmentRegistry = { [fragmentName: string]: { filePath: string; importNames: string[]; onType: string; node: FragmentDefinitionNode } };

type generateImportStatement = (paths: { relativeOutputPath: string; relativeImportPath: string; baseOutputDir: string; importNames?: string[] }) => string;

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
  generateImportStatement: generateImportStatement;
  /**
   *  List of other generated paths that this preset depends on.
   */
  generatedDependencyPaths: Array<string>;
};

/**
 * Transform the preset's provided documents into single-file generator sources, while resolving fragment and user-defined imports
 *
 * Resolves user provided imports and fragment imports using the `DocumentImportResolverOptions`.
 * Does not define specific plugins, but rather returns a string[] of `importStatements` for the calling plugin to make use of
 */
export default function resolveDocumentImportStatements<T>(collectorOptions: DocumentImportResolverOptions, presetOptions: Types.PresetFnArgs<T>, schemaObject: GraphQLSchema) {
  const resolveFragments = buildFragmentResolver(collectorOptions, presetOptions, schemaObject);

  const { baseOutputDir, documents } = presetOptions;
  const { generateFilePath, generateImportStatement, generatedDependencyPaths } = collectorOptions;

  return documents.map(documentFile => {
    const generatedFilePath = generateFilePath(documentFile.filePath);

    const userDefinedImportStatements = generatedDependencyPaths.map(relativeImportPath =>
      generateImportStatement({
        relativeImportPath,
        baseOutputDir,
        relativeOutputPath: generatedFilePath,
      })
    );

    const { externalFragments, fragmentImportStatements } = resolveFragments(generatedFilePath, documentFile.content);

    return {
      filename: generatedFilePath,
      documents: [documentFile],
      importStatements: [...userDefinedImportStatements, ...fragmentImportStatements],
      externalFragments,
    };
  });
}
