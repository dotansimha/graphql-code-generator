import {Model, EnumValue, Field} from './interfaces';
import {GraphQLType} from 'graphql/type/definition';
import {GraphQLEnumType} from 'graphql/type/definition';
import {GraphQLEnumValue} from 'graphql/type/definition';
import {GraphQLObjectType} from 'graphql/type/definition';
import {GraphQLInputObjectType} from 'graphql/type/definition';
import {GraphQLField} from 'graphql/type/definition';
import {GraphQLInterfaceType} from 'graphql/type/definition';
import {GraphQLUnionType} from 'graphql/type/definition';
import {GraphQLList} from 'graphql/type/definition';
import {GraphQLNonNull} from 'graphql/type/definition';
import {getNamedType} from 'graphql/type/definition';
import {shouldSkip, getTypeName, isPrimitive, isArray, isRequired} from './utils';

export const handleType = (primitivesMap: any, typeName: string, type: GraphQLType) => {
  let currentType: Model = {
    imports: [],
    name: typeName,
    fields: [],
    isEnum: false,
    isObject: false
  };

  if (!shouldSkip(typeName)) {
    if (type instanceof GraphQLEnumType) {
      currentType.isEnum = true;
      currentType.enumValues = type.getValues().map<EnumValue>((enumItem: GraphQLEnumValue) => {
        return <EnumValue>{
          name: enumItem.name,
          description: enumItem.description,
          value: enumItem.value
        };
      });
    }
    else if (type instanceof GraphQLObjectType || type instanceof GraphQLInputObjectType || type instanceof GraphQLInterfaceType) {
      currentType.isObject = true;
      const fields = type.getFields();

      if (type instanceof GraphQLObjectType) {
        currentType.implementedInterfaces = type.getInterfaces().map<string>(interf => {
          return interf.name;
        });
        currentType.hasImplementedInterfaces = currentType.implementedInterfaces.length > 0;
      }

      currentType.fields = Object
        .keys(fields)
        .map((fieldName: string) => fields[fieldName])
        .map<Field>((field: GraphQLField<any, any>) => {
          const type = getTypeName(primitivesMap, field.type);

          if (!isPrimitive(primitivesMap, type)) {
            currentType.imports.push(type);
          }

          return {
            name: field.name,
            type: type,
            isArray: isArray(field.type),
            isRequired: isRequired(field.type)
          };
        });
    }
    else if (type instanceof GraphQLUnionType) {
      currentType.name = type.name || typeName;
      currentType.isUnion = true;
      currentType.isObject = false;
      currentType.unionTypes = type.getTypes().map(type => type.name);
      currentType.hasUnionTypes = currentType.unionTypes.length > 0;
    }
    else if (type instanceof GraphQLList || type instanceof GraphQLNonNull) {
      return handleType(primitivesMap, typeName, getNamedType(type));
    }

    return currentType;
  }
  else {
    return null;
  }
};
