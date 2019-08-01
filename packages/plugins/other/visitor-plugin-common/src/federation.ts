import { GraphQLSchema, visit, parse, buildASTSchema, FieldDefinitionNode, Kind, ObjectTypeDefinitionNode, DirectiveNode, StringValueNode, GraphQLObjectType, isObjectType } from 'graphql';
import { printSchemaWithDirectives } from 'graphql-toolkit';

export const useFederation = true;

export const federationSpec = parse(/* GraphQL */ `
  # scalar _FieldSet

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

export function translateResolverParentType(field: FieldDefinitionNode, entity: GraphQLObjectType, parentTypeSignature: string) {
  if (isResolveReferenceFieldNode(field) && isFederationObjectType(entity)) {
    const keys = getDirectivesByName('key', entity);

    if (keys.length) {
      return `${parentTypeSignature} & (${keys
        .map(def => {
          const fieldSet = (def.arguments[0].value as StringValueNode).value;

          return translateFieldSet(fieldSet, parentTypeSignature);
        })
        .join(' | ')})`;
    }
  }

  return parentTypeSignature;
}

function isResolveReferenceFieldNode(node: FieldDefinitionNode): boolean {
  return node.name.value === '__resolveReference';
}

function isFederationObjectType(node: ObjectTypeDefinitionNode | GraphQLObjectType): boolean {
  const name = isObjectType(node) ? node.name : node.name.value;
  const directives = isObjectType(node) ? node.astNode.directives : node.directives;

  const isNotRoot = !['Query', 'Mutation', 'Subscription'].includes(name);
  const isNotIntrospection = !name.startsWith('__');
  const hasKeyDirective = directives.some(d => d.name.value === 'key');

  return isNotRoot && isNotIntrospection && hasKeyDirective;
}

function getDirectivesByName(name: string, node: ObjectTypeDefinitionNode | GraphQLObjectType): DirectiveNode[] {
  return (isObjectType(node) ? node.astNode : node).directives.filter(d => d.name.value === name);
}

function translateFieldSet(fields: string, parentTypeRef: string): string {
  // TODO: support other things than fields separated by a whitespace (fields: "fieldA fieldB fieldC")
  const inner = fields
    .split(/\s+/g)
    .map(field => `${field}: ${parentTypeRef}['${field}']`)
    .join('; ');
  return `{ ${inner} }`;
}
