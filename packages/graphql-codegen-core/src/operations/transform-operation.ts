import { GraphQLObjectType, GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { Operation } from '../types';
import { getRoot } from '../utils/get-root';
import { buildSelectionSet } from './build-selection-set';
import { transformVariables } from './transform-variables';
import { debugLog } from '../debugging';

export function transformOperation(schema: GraphQLSchema, operationNode: OperationDefinitionNode): Operation {
  const name = operationNode.name && operationNode.name.value ? operationNode.name.value : '';
  debugLog(`[transformOperation] transforming operation ${name} of type ${operationNode.operation}`);

  const root: GraphQLObjectType = getRoot(schema, operationNode);
  const variables = transformVariables(schema, operationNode);

  return {
    name,
    selectionSet: buildSelectionSet(schema, root, operationNode.selectionSet),
    operationType: operationNode.operation,
    variables: variables,
    hasVariables: variables.length > 0,
  };
}
