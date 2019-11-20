import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { printSchema, parse, visit } from 'graphql';

type NamedType = {
  kind: 'NamedType';
  value: string;
  isRequired?: boolean;
};

type ListType = {
  kind: 'ListType';
  item: NamedType;
  isRequired?: boolean;
};

type Property = {
  name: string;
  type: ListType | NamedType;
};

type TypeDef = {
  name: string;
  operation: string;
  properties: Array<Property>;
};

const transformScalar = (scalar: string) => {
  const scalarMap = {
    Int: 'number',
    Float: 'number',
    String: 'string',
    Boolean: 'boolean',
    ID: 'string',
  };

  if (scalarMap[scalar] === undefined) {
    return scalar;
  }

  return scalarMap[scalar];
};

const createDocBlock = ({ name, properties }: TypeDef) => {
  const optionalType = 'null|undefined';

  const propertyDefinitions = properties
    .map(property => {
      const name = !property.type.isRequired ? `[${property.name}]` : property.name;

      if (property.type.kind === 'ListType') {
        return ` * @property {Array<${property.type.item.value}${property.type.item.isRequired ? '' : `|${optionalType}`}>} ${name}`;
      }

      return ` * @property {${transformScalar(property.type.value)}} ${name}`;
    })
    .join('\n');

  return `/**
 * @typedef {Object} ${name}
${propertyDefinitions}
 */`;
};

export const plugin: PluginFunction = schema => {
  const visited: Array<TypeDef> = visit(parse(printSchema(schema)), {
    leave: {
      Document(node) {
        return node.definitions;
      },
      ObjectTypeDefinition(node) {
        return {
          name: node.name.value,
          properties: node.fields,
        };
      },
      FieldDefinition(node) {
        return { name: node.name.value, type: node.type };
      },
      NamedType(node) {
        return { kind: node.kind, value: node.name.value };
      },
      NonNullType(node) {
        return { ...node.type, isRequired: true };
      },
      ListType(node) {
        return { kind: node.kind, item: node.type };
      },
    },
  });

  return visited.map(operation => createDocBlock(operation)).join('\n\n');
};
