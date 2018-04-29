import { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { Operation } from '../types';
import { getRoot } from '../utils/get-root';
import { buildSelectionSet, separateSelectionSet } from './build-selection-set';
import { transformVariables } from './transform-variables';
import { debugLog } from '../debugging';
import { print } from 'graphql/language/printer';
import { getDirectives } from '../utils/get-directives';

export function transformOperation(schema: GraphQLSchema, operationNode: OperationDefinitionNode): Operation {
  const name = operationNode.name && operationNode.name.value ? operationNode.name.value : '';
  debugLog(`[transformOperation] transforming operation ${name} of type ${operationNode.operation}`);

  const root = getRoot(schema, operationNode);

  if (!root) {
    throw new Error(`Unable to find the schema root matching: ${operationNode.operation}`);
  }

  const variables = transformVariables(schema, operationNode);
  const directives = getDirectives(schema, operationNode);
  const selectionSet = buildSelectionSet(schema, root, operationNode.selectionSet);

  return {
    name,
    selectionSet,
    operationType: operationNode.operation,
    variables: variables,
    hasVariables: variables.length > 0,
    isQuery: operationNode.operation === 'query',
    isMutation: operationNode.operation === 'mutation',
    isSubscription: operationNode.operation === 'subscription',
    document: print(operationNode),
    directives,
    usesDirectives: Object.keys(directives).length > 0,
    ...separateSelectionSet(selectionSet)
  } as Operation;
}
