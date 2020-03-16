import { Types } from '@graphql-codegen/plugin-helpers';
import {
  BaseVisitor,
  LoadedFragment,
  buildScalars,
  getPossibleTypes,
  getConfigValue,
  RawConfig,
  ParsedConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { resolve } from 'path';
import { Kind, FragmentDefinitionNode, GraphQLSchema, DocumentNode, print } from 'graphql';

import { extractExternalFragmentsInUse, resolveRelativeImport } from './utils';

import { DocumentImportResolverOptions } from './resolve-document-imports';

export interface NearOperationFileParsedConfig extends ParsedConfig {
  importTypesNamespace?: string;
  dedupeOperationSuffix: boolean;
  omitOperationSuffix: boolean;
  fragmentVariablePrefix: string;
  fragmentVariableSuffix: string;
}

export type FragmentRegistry = {
  [fragmentName: string]: { filePath: string; importNames: string[]; onType: string; node: FragmentDefinitionNode };
};

/**
 * Used by `buildFragmentResolver` to  build a mapping of fragmentNames to paths, importNames, and other useful info
 */
function buildFragmentRegistry(
  { generateFilePath }: DocumentImportResolverOptions,
  { documents, config }: Types.PresetFnArgs<{}>,
  schemaObject: GraphQLSchema
) {
  const baseVisitor = new BaseVisitor<RawConfig, NearOperationFileParsedConfig>(config, {
    scalars: buildScalars(schemaObject, config.scalars),
    dedupeOperationSuffix: getConfigValue(config.dedupeOperationSuffix, false),
    omitOperationSuffix: getConfigValue(config.omitOperationSuffix, false),
    fragmentVariablePrefix: getConfigValue(config.fragmentVariablePrefix, ''),
    fragmentVariableSuffix: getConfigValue(config.fragmentVariableSuffix, 'FragmentDoc'),
  });

  const getAllFragmentSubTypes = (possbileTypes: string[], name: string): string[] => {
    const subTypes = [];
    const fragmentSuffix = baseVisitor.getFragmentSuffix(name);

    if (possbileTypes.length === 1) {
      subTypes.push(
        baseVisitor.convertName(name, {
          useTypesPrefix: true,
          suffix: fragmentSuffix,
        })
      );
    } else if (possbileTypes.length !== 0) {
      possbileTypes.forEach(typeName => {
        subTypes.push(
          baseVisitor.convertName(name, {
            useTypesPrefix: true,
            suffix: `_${typeName}_${fragmentSuffix}`,
          })
        );
      });
    }

    return subTypes;
  };

  const duplicateFragmentNames: string[] = [];
  const registry = documents.reduce((prev: FragmentRegistry, documentRecord) => {
    const fragments: FragmentDefinitionNode[] = documentRecord.document.definitions.filter(
      d => d.kind === Kind.FRAGMENT_DEFINITION
    ) as FragmentDefinitionNode[];

    if (fragments.length > 0) {
      for (const fragment of fragments) {
        const schemaType = schemaObject.getType(fragment.typeCondition.name.value);

        if (!schemaType) {
          throw new Error(
            `Fragment "${fragment.name.value}" is set on non-existing type "${fragment.typeCondition.name.value}"!`
          );
        }

        const possibleTypes = getPossibleTypes(schemaObject, schemaType);
        const filePath = generateFilePath(documentRecord.location);
        const importNames = getAllFragmentSubTypes(
          possibleTypes.map(t => t.name),
          fragment.name.value
        );

        if (prev[fragment.name.value] && print(fragment) !== print(prev[fragment.name.value].node)) {
          duplicateFragmentNames.push(fragment.name.value);
        }

        prev[fragment.name.value] = {
          filePath,
          importNames,
          onType: fragment.typeCondition.name.value,
          node: fragment,
        };
      }
    }

    return prev;
  }, {} as FragmentRegistry);

  if (duplicateFragmentNames.length) {
    throw new Error(`Multiple fragments with the name(s) "${duplicateFragmentNames.join(', ')}" were found.`);
  }
  return registry;
}

/**
 *  Builds a fragment "resolver" that collects `externalFragments` definitions and `fragmentImportStatements`
 */
export default function buildFragmentResolver<T>(
  collectorOptions: DocumentImportResolverOptions,
  presetOptions: Types.PresetFnArgs<T>,
  schemaObject: GraphQLSchema
) {
  const fragmentRegistry = buildFragmentRegistry(collectorOptions, presetOptions, schemaObject);
  const { baseOutputDir } = presetOptions;
  const { generateImportStatement } = collectorOptions;

  function resolveFragments(generatedFilePath: string, documentFileContent: DocumentNode) {
    const fragmentsInUse = extractExternalFragmentsInUse(documentFileContent, fragmentRegistry);

    const externalFragments: LoadedFragment<{ level: number }>[] = [];
    // fragment files to import names
    const fragmentFileImports: { [fragmentFile: string]: Set<string> } = {};
    for (const fragmentName of Object.keys(fragmentsInUse)) {
      const level = fragmentsInUse[fragmentName];
      const fragmentDetails = fragmentRegistry[fragmentName];
      if (fragmentDetails) {
        // add top level references to the import object
        // we don't checkf or global namespace because the calling config can do so
        if (level === 0) {
          if (fragmentFileImports[fragmentDetails.filePath] === undefined) {
            fragmentFileImports[fragmentDetails.filePath] = new Set(fragmentDetails.importNames);
          } else {
            fragmentDetails.importNames.forEach(f => fragmentFileImports[fragmentDetails.filePath].add(f));
          }
        }

        const absGeneratedFilePath = resolve(baseOutputDir, generatedFilePath);
        const absFragmentFilePath = resolve(baseOutputDir, fragmentDetails.filePath);

        externalFragments.push({
          level,
          isExternal: true,
          name: fragmentName,
          importFrom: resolveRelativeImport(absGeneratedFilePath, absFragmentFilePath),
          onType: fragmentDetails.onType,
          node: fragmentDetails.node,
        });
      }
    }
    return {
      externalFragments,
      fragmentImportStatements: Object.entries(fragmentFileImports).map(([fragmentsFilePath, importNames]) =>
        generateImportStatement({
          baseOutputDir,
          relativeOutputPath: generatedFilePath,
          importSource: {
            path: fragmentsFilePath,
            names: [...importNames],
          },
        })
      ),
    };
  }
  return resolveFragments;
}
