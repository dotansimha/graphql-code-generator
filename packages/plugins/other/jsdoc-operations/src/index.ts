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

type ScalarType = {
  kind: 'ScalarTypeDefinition';
  name: string;
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

const createTypeDef = (lines: Array<string>) => {
  const typedef = ['/**', ...lines.map(line => ` * ${line}`), ' */'];

  return typedef.join('\n');
};

export const plugin: PluginFunction = schema => {
  const visited: Array<string> = visit(parse(printSchema(schema)), {
    leave: {
      Document(node) {
        return node.definitions;
      },
      ObjectTypeDefinition(node) {
        let fields: Array<string> = [];

        if (node.fields !== undefined) {
          for (let i = 0; i < node.fields.length; i++) {
            fields.push(node.fields[i]);
          }
        }

        return createTypeDef([`@typedef {Object} ${node.name}`, ...fields]);
      },
      UnionTypeDefinition(node) {
        return `/**
 * @typedef {(${node.types.join('|')})} ${node.name}
 */`;
      },
      Name(node) {
        return node.value;
      },
      NamedType(node) {
        return transformScalar(node.name);
      },
      NonNullType(node, _, parent) {
        if (parent === undefined) {
          return;
        }

        if (parent.kind === 'FieldDefinition') {
          parent.nonNullable = true;
        }

        if (parent.kind === 'ListType') {
          parent.nonNullableItems = true;
        }

        return node.type;
      },
      FieldDefinition(node) {
        const fieldName = node.nonNullable ? node.name : `[${node.name}]`;

        return `@property {${node.type}} ${fieldName}`;
      },
      ListType(node) {
        const type = node.nonNullableItems ? node.type : `(${node.type}|null|undefined)`;

        return `Array<${type}>`;
      },
      ScalarTypeDefinition(node) {
        return createTypeDef([`@typedef {*} ${node.name}`]);
      },
    },
  });

  return visited.join('\n\n');
};
