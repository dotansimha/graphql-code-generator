import { OperationDefinitionNode } from 'graphql';

export function generateQueryVariablesSignature(
  hasRequiredVariables: boolean,
  operationVariablesTypes: string
): string {
  return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
}
export function generateInfiniteQueryKey(node: OperationDefinitionNode, hasRequiredVariables: boolean): string {
  if (hasRequiredVariables) return `['${node.name.value}.infinite', variables]`;
  return `variables === undefined ? ['${node.name.value}.infinite'] : ['${node.name.value}.infinite', variables]`;
}

export function generateInfiniteQueryKeyMaker(
  node: OperationDefinitionNode,
  operationName: string,
  operationVariablesTypes: string,
  hasRequiredVariables: boolean
) {
  const signature = generateQueryVariablesSignature(hasRequiredVariables, operationVariablesTypes);
  return `\nuseInfinite${operationName}.getKey = (${signature}) => ${generateInfiniteQueryKey(
    node,
    hasRequiredVariables
  )};\n`;
}

export function generateQueryKey(node: OperationDefinitionNode, hasRequiredVariables: boolean): string {
  if (hasRequiredVariables) return `['${node.name.value}', variables]`;
  return `variables === undefined ? ['${node.name.value}'] : ['${node.name.value}', variables]`;
}

export function generateQueryKeyMaker(
  node: OperationDefinitionNode,
  operationName: string,
  operationVariablesTypes: string,
  hasRequiredVariables: boolean
) {
  const signature = generateQueryVariablesSignature(hasRequiredVariables, operationVariablesTypes);
  return `\nuse${operationName}.getKey = (${signature}) => ${generateQueryKey(node, hasRequiredVariables)};\n`;
}

export function generateMutationKey(node: OperationDefinitionNode): string {
  return `['${node.name.value}']`;
}

export function generateMutationKeyMaker(node: OperationDefinitionNode, operationName: string) {
  return `\nuse${operationName}.getKey = () => ${generateMutationKey(node)};\n`;
}
