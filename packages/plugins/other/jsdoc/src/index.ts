import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import {
  printSchema,
  parse,
  visit,
  ListTypeNode,
  DocumentNode,
  FieldDefinitionNode,
  concatAST,
  InputValueDefinitionNode,
  StringValueNode,
} from 'graphql';
import { DEFAULT_SCALARS, RawDocumentsConfig } from '@graphql-codegen/visitor-plugin-common';

const transformScalar = (scalar: string) => {
  if (DEFAULT_SCALARS[scalar] === undefined) {
    return scalar;
  }

  return DEFAULT_SCALARS[scalar];
};

const createDocBlock = (lines: Array<string>) => {
  const typedef = [
    '/**',
    ...lines
      .filter(t => t && t !== '')
      .reduce((prev, t) => [...prev, ...t.split('\n')], [] as string[])
      .map(line => ` * ${line}`),
    ' */',
  ];
  const block = typedef.join('\n');

  return block;
};

const createDescriptionBlock = (nodeWithDesc: any | { description?: StringValueNode }): string => {
  if (nodeWithDesc?.description?.value) {
    return `@description ${nodeWithDesc.description.value}`;
  }

  return '';
};

export const plugin: PluginFunction<RawDocumentsConfig> = (schema, documents) => {
  const parsedSchema = parse(printSchema(schema));
  const mappedDocuments = documents.map(document => document.document).filter(document => document !== undefined);
  const ast = concatAST([parsedSchema, ...(mappedDocuments as Array<DocumentNode>)]);

  const schemaTypes: Array<string> = visit(ast, {
    Document: {
      leave(node) {
        return node.definitions;
      },
    },
    ObjectTypeDefinition: {
      leave(node: unknown) {
        const typedNode = node as { name: string; fields: Array<string> };

        return createDocBlock([
          `@typedef {Object} ${typedNode.name}`,
          createDescriptionBlock(node),
          ...typedNode.fields,
        ]);
      },
    },
    InputObjectTypeDefinition: {
      leave(node: unknown) {
        const typedNode = node as { name: string; fields: Array<string> };

        return createDocBlock([
          `@typedef {Object} ${typedNode.name}`,
          createDescriptionBlock(node),
          ...typedNode.fields,
        ]);
      },
    },
    InterfaceTypeDefinition: {
      leave(node: unknown) {
        const typedNode = node as { name: string; fields: Array<string> };

        return createDocBlock([
          `@typedef {Object} ${typedNode.name}`,
          createDescriptionBlock(node),
          ...typedNode.fields,
        ]);
      },
    },
    UnionTypeDefinition: {
      leave(node) {
        if (node.types !== undefined) {
          return createDocBlock([`@typedef {(${node.types.join('|')})} ${node.name}`, createDescriptionBlock(node)]);
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
          return node;
        }

        return node.type;
      },
    },
    Directive: {
      enter(node) {
        if (node.name.value !== 'deprecated') {
          return null;
        }

        const reason = node.arguments?.find(arg => arg.name.value === 'reason');

        if (reason?.value.kind !== 'StringValue') {
          return null;
        }

        return ` - DEPRECATED: ${reason.value.value}`;
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
        const description = node.description && node.description.value ? ` - ${node.description.value}` : '';
        const directives = node?.directives?.filter(d => d !== null && d !== undefined);

        return `@property {${node.type}} ${fieldName}${description}${directives}`;
      },
    },
    InputValueDefinition: {
      enter(node) {
        if (node.type.kind === 'NonNullType') {
          return { ...node, nonNullable: true };
        }

        return node;
      },
      leave(node: InputValueDefinitionNode & { nonNullable?: boolean }) {
        const fieldName = node.nonNullable ? node.name : `[${node.name}]`;

        return `@property {${node.type}} ${fieldName}${
          node.description && node.description.value ? ` - ${node.description.value}` : ''
        }`;
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
        return createDocBlock([`@typedef {*} ${node.name}`, createDescriptionBlock(node)]);
      },
    },
    EnumTypeDefinition: {
      leave(node) {
        const values = node?.values?.map(value => `"${value.name}"`).join('|');

        /** If for some reason the enum does not contain any values we fallback to "any" or "*" */
        const valueType = values ? `(${values})` : '*';

        return createDocBlock([`@typedef {${valueType}} ${node.name}`, createDescriptionBlock(node)]);
      },
    },
    OperationDefinition: {
      enter() {
        /** This plugin currently does not support operations yet. */
        return null;
      },
    },
    FragmentDefinition: {
      enter() {
        /** This plugin currently does not support fragments yet. */
        return null;
      },
    },
  });

  return schemaTypes.join('\n\n');
};
