import { OperationDefinitionNode } from 'graphql';

export function generateVariablesSignature(hasRequiredVariables: boolean, operationVariablesTypes: string): string {
  return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
}

export function generateKey(node: OperationDefinitionNode, hasRequiredVariables: boolean): string {
  if (hasRequiredVariables) return `['${node.name.value}', variables]`;
  return `variables === undefined ? ['${node.name.value}'] : ['${node.name.value}', variables]`;
}

export function generateKeyMaker(
  node: OperationDefinitionNode,
  operationName: string,
  operationVariablesTypes: string,
  hasRequiredVariables: boolean
) {
  const signature = generateVariablesSignature(hasRequiredVariables, operationVariablesTypes);
  return `\nuse${operationName}.getKey = (${signature}) => ${generateKey(node, hasRequiredVariables)};\n`;
}
