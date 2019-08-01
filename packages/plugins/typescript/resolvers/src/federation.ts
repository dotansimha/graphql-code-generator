import { GraphQLSchema, visit, parse, buildASTSchema, FieldDefinitionNode, Kind, ObjectTypeDefinitionNode } from 'graphql';
import { printSchemaWithDirectives } from 'graphql-toolkit';

export const useFederation = true;

export const federationSpec = parse(/* GraphQL */ `
  scalar _FieldSet

  directive @external on FIELD_DEFINITION
  directive @requires(fields: _FieldSet!) on FIELD_DEFINITION
  directive @provides(fields: _FieldSet!) on FIELD_DEFINITION
  directive @key(fields: _FieldSet!) on OBJECT | INTERFACE
`);

export function addFederationToSchema(schema: GraphQLSchema) {
  const doc = parse(printSchemaWithDirectives(schema));
  const visited = visit(doc, {
    ObjectTypeDefinition(node) {
      if (!isFederationObjectType(node)) {
        return node;
      }

      return {
        ...node,
        fields: [
          {
            kind: Kind.FIELD_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: '__resolveReference',
            },
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: node.name.value,
              },
            },
            arguments: [],
          } as FieldDefinitionNode,
          ...node.fields,
        ],
      };
    },
  });

  return buildASTSchema({
    ...visited,
    definitions: [...federationSpec.definitions, ...visited.definitions],
  });
}

function isFederationObjectType(node: ObjectTypeDefinitionNode): boolean {
  const isNotRoot = !['Query', 'Mutation', 'Subscription'].includes(node.name.value);
  const isNotIntrospection = !node.name.value.startsWith('__');
  const hasKeyDirective = node.directives.some(d => d.name.value === 'key');

  return isNotRoot && isNotIntrospection && hasKeyDirective;
}
