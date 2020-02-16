import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { printSchema, parse, visit, ListTypeNode, FieldDefinitionNode, concatAST, SelectionNode, FieldNode, FragmentSpreadNode } from 'graphql';
import { DEFAULT_SCALARS, RawDocumentsConfig, SelectionSetToObject } from '@graphql-codegen/visitor-plugin-common';

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

const generateSelectionSetTypes = (node: FieldNode, operationName: string, path = ['Query']): string => {
  const fieldName = (node.name as unknown) as string;
  if (node.selectionSet) {
    const selections = node.selectionSet.selections.map(selection => {
      if (selection.kind === 'Field') {
        return generateSelectionSetTypes(selection, operationName, [...path, fieldName]);
      }

      return '';
    });

    return [`@typedef {Object} ${operationName}${path.join('')}${fieldName}`, ...selections].join('\n');
  } else {
    return `@property {${path.join('.')}.${fieldName}} ${fieldName}`;
  }
};

export const plugin: PluginFunction<RawDocumentsConfig> = (schema, documents) => {
  const parsedSchema = parse(printSchema(schema));
  const mappedDocuments = documents.map(document => document.content);
  const ast = concatAST([parsedSchema, ...mappedDocuments]);

  const schemaTypes: Array<string> = visit(ast, {
    Document: {
      leave(node) {
        return node.definitions;
      },
    },
    OperationDefinition: {
      leave(node) {
        const operationName = `${node.name}${node.operation}`;
        const docblock = createDocBlock([`@typedef {Object} ${operationName}`]);

        const selections = node.selectionSet.selections
          .map(selection => {
            if (selection.kind === 'Field') {
              return generateSelectionSetTypes(selection, (node.name as unknown) as string);
            } else {
              return '';
            }
          })
          .join('\n');

        return `${docblock}${selections}`;
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

  return schemaTypes.join('\n\n');
};
