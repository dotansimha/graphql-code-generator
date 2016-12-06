import {
  GraphQLSchema,
  Source,
  GraphQLType,
  TypeMap,
  GraphQLEnumType,
  GraphQLEnumValueDefinition,
  GraphQLObjectType,
  GraphQLFieldDefinition,
  GraphQLInterfaceType,
  GraphQLInputObjectType,
  GraphQLUnionType,
  GraphQLList,
  GraphQLNonNull,
  getNamedType
} from 'graphql';
import {Codegen, Model, EnumValue, Field} from './interfaces';
import unregisterDecorator = Handlebars.unregisterDecorator;

type ModelsObject = {[modelName: string]: Model};

const shouldSkip = (typeName: string): boolean => {
  return !typeName ||
    typeName.indexOf('__') > -1
};

// TODO: this is specific for TypeScript, need to get outside into a JSON settings file per language generator
const primitivesMap = {
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
  ID: 'string',
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

const handleType = (typeName: string, type: GraphQLType) => {
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
      currentType.enumValues = type.getValues().map<EnumValue>((enumItem: GraphQLEnumValueDefinition) => {
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
        .map<Field>((field: GraphQLFieldDefinition) => {
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

export const prepareCodegen = (schema: GraphQLSchema, documents: Source[]): Codegen => {
  let models: ModelsObject = {};
  let typesMap: TypeMap = schema.getTypeMap();

  Object.keys(typesMap).forEach(typeName => {
    models[typeName] = handleType(typeName, typesMap[typeName]);
  });

  return <Codegen>{
    models: Object.keys(models).map(key => models[key]),
    documents: []
  };
};
