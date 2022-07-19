import { ListValueNode, OperationDefinitionNode, StringValueNode } from 'graphql';

export function generateQueryVariablesSignature(
  hasRequiredVariables: boolean,
  operationVariablesTypes: string
): string {
  return `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
}
export function generateInfiniteQueryKey(node: OperationDefinitionNode, hasRequiredVariables: boolean): string {
  const keyDirective = node.directives?.find(d => d.name.value == 'reactQueryKey');
  const keyPrefix = keyDirective
    ? (keyDirective.arguments[0].value as ListValueNode).values
        .map((v: StringValueNode) => JSON.stringify(v.value))
        .join(', ')
    : `'${node.name.value}.infinite'`;
  if (hasRequiredVariables) return `[${keyPrefix}, variables]`;
  return `variables === undefined ? [${keyPrefix}] : [${keyPrefix}, variables]`;
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
  const keyDirective = node.directives?.find(d => d.name.value == 'reactQueryKey');
  const keyPrefix = keyDirective
    ? (keyDirective.arguments[0].value as ListValueNode).values
        .map((v: StringValueNode) => JSON.stringify(v.value))
        .join(', ')
    : `'${node.name.value}'`;
  if (hasRequiredVariables) return `[${keyPrefix}, variables]`;
  return `variables === undefined ? [${keyPrefix}] : [${keyPrefix}, variables]`;
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
