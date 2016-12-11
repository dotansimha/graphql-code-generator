import {GraphQLInterfaceType} from 'graphql/type/definition';
import {GraphQLObjectType} from 'graphql/type/definition';
import {TypeNameMetaFieldDef} from 'graphql/type/introspection';
import {GraphQLUnionType} from 'graphql/type/definition';
import {TypeMetaFieldDef} from 'graphql/type/introspection';
import {SchemaMetaFieldDef} from 'graphql/type/introspection';
import {GraphQLField} from 'graphql/type/definition';

export function getFieldDef(schema, parentType, fieldAST): GraphQLField<any, any> {
  const name = fieldAST.name.value;
  if (name === SchemaMetaFieldDef.name &&
    schema.getQueryType() === parentType) {
    return SchemaMetaFieldDef;
  }
  if (name === TypeMetaFieldDef.name &&
    schema.getQueryType() === parentType) {
    return TypeMetaFieldDef;
  }
  if (name === TypeNameMetaFieldDef.name &&
    (parentType instanceof GraphQLObjectType ||
    parentType instanceof GraphQLInterfaceType ||
    parentType instanceof GraphQLUnionType)
  ) {
    return TypeNameMetaFieldDef;
  }
  if (parentType instanceof GraphQLObjectType ||
    parentType instanceof GraphQLInterfaceType) {
    return parentType.getFields()[name];
  }
}
