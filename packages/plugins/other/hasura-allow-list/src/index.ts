import {
  DefinitionNode,
  ExecutableDefinitionNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  Kind,
  OperationDefinitionNode,
  print,
  visit,
} from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { HasuraAllowListPluginConfig } from './config.js';

import yaml from 'yaml';

/**
 * Returns an array of fragments required for a given operation, recursively.
 * Will throw an error if it cannot find one of the fragments required for the operation.
 * @param operationDefinition the operation we want to find fragements for.
 * @param fragmentDefinitions a list of fragments from the same document, some of which may be required by the operation.
 * @param documentLocation location of the document the operation is sourced from. Only used to improve error messages.
 * @returns an array of fragments required for the operation.
 */
function getOperationFragmentsRecursively(
  operationDefinition: OperationDefinitionNode,
  fragmentDefinitions: FragmentDefinitionNode[],
  documentLocation: string
): FragmentDefinitionNode[] {
  const requiredFragmentNames = new Set<string>();

  getRequiredFragments(operationDefinition);

  // note: we first get a list of required fragments names, then filter the original list.
  // this means order of fragments is preserved.
  return fragmentDefinitions.filter(definition => requiredFragmentNames.has(definition.name.value));

  /**
   * Given a definition adds required fragments to requieredFragmentsNames, recursively.
   * @param definition either an operation definition or a fragment definition.
   */
  function getRequiredFragments(definition: ExecutableDefinitionNode) {
    visit(definition, {
      FragmentSpread(fragmentSpreadNode) {
        // added this check to prevent infinite recursion on recursive fragment definition (which itself isn't legal graphql)
        // it seems graphql crashes anyways if a recursive fragment is defined, so maybe remove this check?
        if (!requiredFragmentNames.has(fragmentSpreadNode.name.value)) {
          requiredFragmentNames.add(fragmentSpreadNode.name.value);

          const fragmentDefinition = fragmentDefinitions.find(
            definition => definition.name.value === fragmentSpreadNode.name.value
          );

          if (!fragmentDefinition) {
            throw new Error(
              `Missing fragment ${fragmentSpreadNode.name.value} for ${
                definition.kind === Kind.FRAGMENT_DEFINITION ? 'fragment' : 'operation'
              } ${definition.name.value} in file ${documentLocation}`
            );
          } else {
            getRequiredFragments(fragmentDefinition);
          }
        }
        return fragmentSpreadNode;
      },
    });
  }
}

/**
 * Gets a list of fragments from all documents. Will enforce fragment name uniqueness
 * @param documents All the documents from which fragments will be extracted
 * @returns global fragment definitions, guaranteed to have unique names
 */
function getGlobalFragments(documents: Types.DocumentFile[]): FragmentDefinitionNode[] {
  // keep a dictionary of each fragment and its location for better error messages
  const fragmentDictionary = new Map<string, string>();

  // iterate over each document's fragments, and add them to the map
  for (const document of documents) {
    const fragmentDefinitions = document.document.definitions.filter(namedFragmentDefinitionFilter);
    for (const fragment of fragmentDefinitions) {
      const fragmentName = fragment.name.value;
      // if the map already has a fragment by that name, throw an error with locations for both definitions
      if (fragmentDictionary.has(fragment.name.value)) {
        const locationA = document.location;
        const locationB = fragmentDictionary.get(fragmentName);
        throw new Error(`Duplicate fragment definitions for ${fragmentName} in files ${locationA}, ${locationB}`);
      }
      fragmentDictionary.set(fragmentName, document.location);
    }
  }

  return documents.flatMap(document => document.document.definitions.filter(namedFragmentDefinitionFilter));
}

function getDocumentFragments(document: Types.DocumentFile): FragmentDefinitionNode[] {
  return document.document.definitions.filter(namedFragmentDefinitionFilter);
}

function namedOperationDefinitionFilter(definition: DefinitionNode): definition is OperationDefinitionNode {
  return definition.kind === Kind.OPERATION_DEFINITION && !!definition.name;
}
function namedFragmentDefinitionFilter(definition: DefinitionNode): definition is FragmentDefinitionNode {
  return definition.kind === Kind.FRAGMENT_DEFINITION && !!definition.name;
}

export const plugin: PluginFunction<HasuraAllowListPluginConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: HasuraAllowListPluginConfig
): Promise<Types.PluginOutput> => {
  const queries: { name: string; query: string }[] = [];

  // if config global_fragments is set, get fragments from all documents
  const globalFragments = !config.global_fragments ? false : getGlobalFragments(documents);

  for (const document of documents) {
    // filter out anonymous operations
    const documentOperations = document.document.definitions.filter(namedOperationDefinitionFilter);

    // depending on global_fragments settings, either use document level or global level fragments
    const fragments = globalFragments || getDocumentFragments(document);

    // for each operation in the document
    for (const operation of documentOperations) {
      // get fragments required by the operations
      const requiredFragmentDefinitions = getOperationFragmentsRecursively(operation, fragments, document.location);

      // insert the operation and any fragments to our queries definition.
      // fragment order is preserved, and each fragment is separated by a new line
      queries.push({
        name: operation.name.value,
        query: [operation, ...requiredFragmentDefinitions].map(print).join('\n'),
      });
    }
  }

  return yaml.stringify([
    {
      name: config.collection_name ?? 'allowed-queries',
      definition: {
        queries,
      },
    },
  ]);
};

export default { plugin };
