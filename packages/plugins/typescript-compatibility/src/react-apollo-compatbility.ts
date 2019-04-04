import { BaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { OperationDefinitionNode } from 'graphql';

export function createReactApolloCompatibility(baseVisitor: BaseVisitor, operation: OperationDefinitionNode): string {
  return '';
}
