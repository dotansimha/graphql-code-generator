import { Source } from '@graphql-tools/utils';
import { SourceWithOperations, OperationOrFragment } from '@graphql-codegen/gql-tag-operations';
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';

export type BuildNameFunction = (type: OperationDefinitionNode | FragmentDefinitionNode) => string;

export function processSources(sources: Array<Source>, buildName: BuildNameFunction) {
  const sourcesWithOperations: Array<SourceWithOperations> = [];

  for (const source of sources) {
    const { document } = source;
    const operations: Array<OperationOrFragment> = [];

    for (const definition of document?.definitions ?? []) {
      if (definition?.kind !== `OperationDefinition` && definition?.kind !== 'FragmentDefinition') continue;

      if (definition.name?.kind !== `Name`) continue;

      operations.push({
        initialName: buildName(definition),
        definition,
      });
    }

    if (operations.length === 0) continue;

    sourcesWithOperations.push({
      source,
      operations,
    });
  }

  return sourcesWithOperations;
}
