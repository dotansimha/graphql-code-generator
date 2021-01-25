import { OperationDefinitionNode } from 'graphql';

export function generateQueryVariablesSignature(
  hasRequiredVariables: boolean,
  operationVariablesTypes: string
): string {
  return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
}

export function generateQueryKey(node: OperationDefinitionNode): string {
  return `['${node.name.value}', variables]`;
}

export function generateQueryKeyMaker(
  node: OperationDefinitionNode,
  operationName: string,
  operationVariablesTypes: string,
  hasRequiredVariables: boolean
) {
  const signature = generateQueryVariablesSignature(hasRequiredVariables, operationVariablesTypes);
  return `\nuse${operationName}.getKey = (${signature}) => ${generateQueryKey(node)};\n`;
}
