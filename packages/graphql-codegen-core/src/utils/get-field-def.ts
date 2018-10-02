import { GraphQLField, GraphQLInterfaceType, GraphQLObjectType, GraphQLType, FieldNode } from 'graphql';

export function getFieldDef(parentType: GraphQLType, fieldAST: FieldNode): GraphQLField<any, any> {
  const name = fieldAST.name.value;

  if (name === '__typename') {
    return null;
  }

  if (parentType instanceof GraphQLObjectType || parentType instanceof GraphQLInterfaceType) {
    return parentType.getFields()[name];
  }

  return null;
}
