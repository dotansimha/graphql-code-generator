import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { printSchema, parse, visit, ListTypeNode, FieldDefinitionNode, NamedTypeNode } from 'graphql';
import { DEFAULT_SCALARS } from '@graphql-codegen/visitor-plugin-common';

const transformScalar = (scalar: string) => {
  if (DEFAULT_SCALARS[scalar] === undefined) {
    return scalar;
  }

  return DEFAULT_SCALARS[scalar];
};

const createDocBlock = (lines: Array<string>) => {
  const typedef = ['/**', ...lines.map(line => ` * ${line}`), ' */'];
  const block = typedef.join('\n');

  return block;
};

export const plugin: PluginFunction = schema => {
  const visited: Array<string> = visit(parse(printSchema(schema)), {
    Document: {
      leave(node) {
        return node.definitions;
      },
    },
    ObjectTypeDefinition: {
      leave(node: unknown) {
        const typedNode = node as { name: string; fields: Array<string> };

        return createDocBlock([`@typedef {Object} ${typedNode.name}`, ...typedNode.fields]);
      },
    },
    UnionTypeDefinition: {
      leave(node) {
        if (node.types !== undefined) {
          return `/**
 * @typedef {(${node.types.join('|')})} ${node.name}
 */`;
        }

        return node;
      },
    },
    Name: {
      leave(node) {
        return node.value;
      },
    },
    NamedType: {
      leave(node: unknown) {
        return transformScalar((node as { name: string }).name);
      },
    },
    NonNullType: {
      leave(node, _, parent) {
        if (parent === undefined) {
          return;
        }

        return node.type;
      },
    },
    FieldDefinition: {
      enter(node) {
        if (node.type.kind === 'NonNullType') {
          return { ...node, nonNullable: true };
        }

        return node;
      },
      leave(node: FieldDefinitionNode & { nonNullable?: boolean }) {
        const fieldName = node.nonNullable ? node.name : `[${node.name}]`;

        return `@property {${node.type}} ${fieldName}`;
      },
    },
    ListType: {
      enter(node) {
        if (node.type.kind === 'NonNullType') {
          return { ...node, nonNullItems: true };
        }

        return node;
      },
      leave(node: ListTypeNode & { nonNullItems?: boolean }) {
        const type = node.nonNullItems ? node.type : `(${node.type}|null|undefined)`;

        return `Array<${type}>`;
      },
    },
    ScalarTypeDefinition: {
      leave(node) {
        return createDocBlock([`@typedef {*} ${node.name}`]);
      },
    },
  });

  return visited.join('\n\n');
};
