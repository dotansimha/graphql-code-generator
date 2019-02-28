import { GraphQLField, GraphQLType, FieldNode, isObjectType, isInterfaceType } from 'graphql';

export function getFieldDef(parentType: GraphQLType, fieldAST: FieldNode): GraphQLField<any, any> {
  const name = fieldAST.name.value;

  if (name === '__typename') {
    return null;
  }

  if (isObjectType(parentType) || isInterfaceType(parentType)) {
    return parentType.getFields()[name];
  }

  return null;
}
