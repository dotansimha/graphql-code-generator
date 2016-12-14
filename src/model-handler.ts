import {Model, EnumValue, Field} from './interfaces';
import {
  getNamedType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLUnionType,
  GraphQLInterfaceType,
  GraphQLField,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLEnumValue,
  GraphQLEnumType,
  GraphQLType,
  GraphQLScalarType
} from 'graphql/type/definition';
import {shouldSkip, getTypeName, isPrimitive, isArray, isRequired} from './utils';

const ignoredScalars = ['Boolean', 'Float', 'String', 'ID', 'Int']

export const handleType = (primitivesMap: any, type: GraphQLType) => {
  const typeName = type['name'];

  let currentType: Model = {
    imports: [],
    name: typeName,
    fields: [],
    isEnum: false,
    isObject: false,
    isCustomScalar: false
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
      return handleType(primitivesMap, getNamedType(type));
    }
    else if (type instanceof GraphQLScalarType && ignoredScalars.indexOf(currentType.name) === -1) {
      currentType.isCustomScalar = true;
    }

      return currentType;
  }
  else {
    return null;
  }
};
