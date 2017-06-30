import { GraphQLSchema, OperationDefinitionNode, typeFromAST, VariableDefinitionNode } from 'graphql';
import { Variable } from '../types';
import { resolveType } from '../schema/resolve-type';

export function transformVariables(schema: GraphQLSchema, definitionNode: OperationDefinitionNode): Variable[] {
  return definitionNode.variableDefinitions.map<Variable>((variableDefinition: VariableDefinitionNode): Variable => {
    const typeFromSchema = typeFromAST(schema, variableDefinition.type);
    const resolvedType = resolveType(typeFromSchema);

    return {
      name: variableDefinition.variable.name.value,
      type: resolvedType.name,
      isArray: resolvedType.isArray,
      isRequired: resolvedType.isRequired,
    };
  });
}
