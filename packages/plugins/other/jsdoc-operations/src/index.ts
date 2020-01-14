import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { printSchema, parse, visit } from 'graphql';
import { DEFAULT_SCALARS } from '@graphql-codegen/visitor-plugin-common';

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
  properties?: Array<Property>;
  types?: Array<NamedType>;
};

const transformScalar = (scalar: string) => {
  if (DEFAULT_SCALARS[scalar] === undefined) {
    return scalar;
  }

  return DEFAULT_SCALARS[scalar];
};

const createTypeDef = ({ name, properties, types }: TypeDef) => {
  const optionalType = 'null|undefined';
  const typeDef = [`/**`];

  if (types) {
    typeDef.push(` * @typedef {(${types.map(type => type.value).join('|')})} ${name}`);
  } else {
    typeDef.push(` * @typedef {Object} ${name}`);
  }

  if (properties) {
    typeDef.push(
      ...properties.map(property => {
        const name = !property.type.isRequired ? `[${property.name}]` : property.name;

        if (property.type.kind === 'ListType') {
          return ` * @property {Array<${property.type.item.value}${property.type.item.isRequired ? '' : `|${optionalType}`}>} ${name}`;
        }

        return ` * @property {${transformScalar(property.type.value)}} ${name}`;
      })
    );
  }

  return [...typeDef, ' */'].join('\n');
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
        return {
          name: node.name.value,
          type: node.type,
        };
      },
      NamedType(node) {
        return {
          kind: node.kind,
          value: node.name.value,
        };
      },
      NonNullType(node) {
        return {
          ...node.type,
          isRequired: true,
        };
      },
      UnionTypeDefinition(node) {
        return {
          kind: node.kind,
          name: node.name.value,
          types: node.types,
        };
      },
      ListType(node) {
        return {
          kind: node.kind,
          item: node.type,
        };
      },
    },
  });

  return visited.map(operation => createTypeDef(operation)).join('\n\n');
};
