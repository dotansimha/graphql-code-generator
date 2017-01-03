import {Model, EnumValue, Field} from '../models/interfaces';
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
  GraphQLScalarType,
  GraphQLArgument
} from 'graphql/type/definition';
import {GraphQLSchema} from 'graphql/type/schema';
import {shouldSkip, getTypeName, isPrimitive, isArray, isRequired} from '../utils/utils';
import pascalCase = require('pascal-case');

const ignoredScalars = ['Boolean', 'Float', 'String', 'ID', 'Int'];

export const buildArgumentsType = (primitivesMap, fieldName: string, typeName: string, argumentsArr: Array<GraphQLArgument> = []) => {
  let argsModel: Model = {
    imports: [],
    name: pascalCase(fieldName) + typeName,
    fields: [],
    isEnum: false,
    isObject: true,
    isArgumentsType: true,
    isCustomScalar: false
  };

  argsModel.fields = argumentsArr.map<Field>((argDefinition: GraphQLArgument) => {
    const type = getTypeName(primitivesMap, argDefinition.type);

    return {
      name: argDefinition.name,
      type: type,
      isArray: isArray(argDefinition.type),
      isRequired: isRequired(argDefinition.type)
    };
  });

  return argsModel;
};

export const handleType = (schema: GraphQLSchema, primitivesMap: any, type: GraphQLType): Model[] => {
  const typeName = type['name'];
  const resultArr: Model[] = [];

  let currentType: Model = {
    imports: [],
    name: typeName,
    fields: [],
    isEnum: false,
    isObject: false,
    isCustomScalar: false
  };

  resultArr.push(currentType);

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
      currentType.isInput = type instanceof GraphQLInputObjectType;
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
          const fieldArguments = field.args || [];

          if (fieldArguments.length > 0) {
            resultArr.push(buildArgumentsType(primitivesMap, field.name, typeName, fieldArguments));
          }

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
      return handleType(schema, primitivesMap, getNamedType(type));
    }
    else if (type instanceof GraphQLScalarType && ignoredScalars.indexOf(currentType.name) === -1) {
      currentType.isCustomScalar = true;
    }

    return resultArr;
  }
  else {
    return null;
  }
};
