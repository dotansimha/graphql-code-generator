import {
  ExecutableDefinitionNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  Kind,
  OperationDefinitionNode,
  print,
  visit,
} from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { HasuraAllowListPluginConfig } from './config';

import yaml from 'yaml';

function getOperationFragmentsRecursively(
  operationDefinition: OperationDefinitionNode,
  fragmentDefinitions: FragmentDefinitionNode[],
  documentLocation: string
): FragmentDefinitionNode[] {
  const requiredFragmentNames = new Set<string>();

  getRequiredFragments(operationDefinition);

  return fragmentDefinitions.filter(definition => requiredFragmentNames.has(definition.name.value));

  function getRequiredFragments(definition: ExecutableDefinitionNode) {
    visit(definition, {
      FragmentSpread(fragmentSpreadNode) {
        // added this check to prevent infinite recursion.
        // seems things crash anyways, so maybe I should remove it?
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

export const plugin: PluginFunction<HasuraAllowListPluginConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: HasuraAllowListPluginConfig
): Promise<Types.PluginOutput> => {
  const queries: { name: string; query: string }[] = [];

  // each document is handled independently.
  // this means any fragments will have to be defined in the same operation list
  for (const document of documents) {
    // filter out anonymous operations
    const documentOperations = document.document.definitions.filter(
      (definition): definition is OperationDefinitionNode =>
        definition.kind === Kind.OPERATION_DEFINITION && !!definition.name
    );
    // filter out anonymous fragments
    const documentFragments = document.document.definitions.filter(
      (definition): definition is FragmentDefinitionNode =>
        definition.kind === Kind.FRAGMENT_DEFINITION && !!definition.name
    );

    for (const operation of documentOperations) {
      const requiredFragmentDefinitions = getOperationFragmentsRecursively(
        operation,
        documentFragments,
        document.location
      );

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
