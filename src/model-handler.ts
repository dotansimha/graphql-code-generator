import {Model, EnumValue, Field} from "./interfaces";
import {GraphQLType} from "graphql/type/definition";
import {GraphQLEnumType} from "graphql/type/definition";
import {GraphQLEnumValue} from "graphql/type/definition";
import {GraphQLObjectType} from "graphql/type/definition";
import {GraphQLInputObjectType} from "graphql/type/definition";
import {GraphQLField} from "graphql/type/definition";
import {GraphQLInterfaceType} from "graphql/type/definition";
import {GraphQLUnionType} from "graphql/type/definition";
import {GraphQLList} from "graphql/type/definition";
import {GraphQLNonNull} from "graphql/type/definition";
import {getNamedType} from "graphql/type/definition";

// TODO: this is specific for TypeScript, need to get outside into a JSON settings file per language generator
const primitivesMap = {
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
  ID: 'string',
};

const shouldSkip = (typeName: string): boolean => {
  return !typeName ||
    typeName.indexOf('__') > -1
};

const isRequired = (type: GraphQLType): boolean => {
  return (type.toString()).indexOf('!') > -1;
};

const isArray = (type: GraphQLType): boolean => {
  return (type.toString()).indexOf('[') > -1;
};

const getTypeName = (type: GraphQLType) => {
  const name = (type.toString()).replace(/[\[\]!]/g, '');

  if (primitivesMap[name]) {
    return primitivesMap[name];
  }
  else {
    return name;
  }
};

export const handleType = (typeName: string, type: GraphQLType) => {
  let currentType: Model = {
    name: typeName,
    fields: [],
    isFragment: false,
    isEnum: false,
    isObject: false,
    isInterface: false,
    isUnion: false
  };

  if (!shouldSkip(typeName)) {
    if (type instanceof GraphQLEnumType) {
      currentType.isEnum = true;
      currentType.enumValues = type.getValues().map<EnumValue>((enumItem: GraphQLEnumValue) => {
        return <EnumValue>{
          name: enumItem.name,
          description: enumItem.description,
          value: enumItem.value
        }
      });
    }
    else if (type instanceof GraphQLObjectType || type instanceof GraphQLInputObjectType) {
      currentType.isObject = true;
      const fields = type.getFields();

      currentType.fields = Object
        .keys(fields)
        .map((fieldName: string) => fields[fieldName])
        .map<Field>((field: GraphQLField<any, any>) => {
          return {
            name: field.name,
            type: getTypeName(field.type),
            isArray: isArray(field.type),
            isRequired: isRequired(field.type)
          };
        });
    }
    else if (type instanceof GraphQLInterfaceType) {
      currentType.isInterface = true;
      // TODO: implemented
    }
    else if (type instanceof GraphQLUnionType) {
      currentType.isUnion = true;
      // TODO: implemented
    }
    else if (type instanceof GraphQLList || type instanceof GraphQLNonNull) {
      return handleType(typeName, getNamedType(type));
    }

    return currentType;
  }
  else {
    return null;
  }
};