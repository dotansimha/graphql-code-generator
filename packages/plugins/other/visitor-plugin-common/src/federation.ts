import { GraphQLSchema, visit, parse, buildASTSchema, FieldDefinitionNode, Kind, ObjectTypeDefinitionNode, DirectiveNode, StringValueNode, GraphQLObjectType, isObjectType, isNonNullType, GraphQLNamedType } from 'graphql';
import { printSchemaWithDirectives } from 'graphql-toolkit';
import { getBaseType } from './utils';

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
          // we can't filter them out because we need them later on
          // ...node.fields.filter(field => !isExternal(field) || hasProvides(node, field, providesMap)),
        ],
      };
    },
  });

  return buildASTSchema({
    ...visited,
    definitions: [...federationSpec.definitions, ...visited.definitions],
  });
}

export function federationInResolvers(typeNames: string[]) {
  return typeNames.filter(t => t !== '_FieldSet');
}

export function federationInDirectiveDefinition(name: string) {
  if (['external', 'requires', 'provides', 'key'].includes(name)) {
    return {
      skip: true,
    };
  }

  return {
    notFederation: true,
  };
}

export function federationInScalarTypeDefinition(name: string) {
  if (name === '_FieldSet') {
    return {
      skip: true,
    };
  }

  return {
    notFederation: true,
  };
}

export function federationInFieldDefinition({ fieldNode, parentType, schema }: { fieldNode: FieldDefinitionNode; parentType: GraphQLNamedType; schema: GraphQLSchema }) {
  if (!isObjectType(parentType) || !isFederationObjectType(parentType)) {
    return {
      notFederation: true,
    };
  }

  const providesMap = createMapOfProvides(schema);

  if (isExternalAndNotProvided(fieldNode, parentType, providesMap)) {
    return {
      skip: true,
    };
  }

  return {
    translateResolverParentType(parentTypeSignature: string) {
      return translateResolverParentType(fieldNode, parentType, parentTypeSignature);
    },
  };
}

function translateResolverParentType(field: FieldDefinitionNode, entity: GraphQLObjectType, parentTypeSignature: string) {
  if (isFederationObjectType(entity)) {
    const keys = getDirectivesByName('key', entity);

    if (keys.length) {
      const requires = getDirectivesByName('requires', field)
        .map(extractFieldSet)
        .reduce((prev, curr) => [...prev, ...curr], [])
        .map(name => {
          return { name, required: isNonNullType(entity.getFields()[name].type) };
        });
      const requiredFields = translateFieldSet(requires, parentTypeSignature);

      const extra: string = requires.length ? ` & ${requiredFields}` : '';

      return `(${keys
        .map(def => {
          const fields = extractFieldSet(def).map(name => ({ name, required: true }));
          return translateFieldSet(fields, parentTypeSignature);
        })
        .join(' | ')})${extra}`;
    }
  }

  return parentTypeSignature;
}

function deduplicate<T>(items: T[]): T[] {
  return items.filter((item, i) => items.indexOf(item) === i);
}

function isFederationObjectType(node: ObjectTypeDefinitionNode | GraphQLObjectType): boolean {
  const name = isObjectType(node) ? node.name : node.name.value;
  const directives = isObjectType(node) ? node.astNode.directives : node.directives;

  const isNotRoot = !['Query', 'Mutation', 'Subscription'].includes(name);
  const isNotIntrospection = !name.startsWith('__');
  const hasKeyDirective = directives.some(d => d.name.value === 'key');

  return isNotRoot && isNotIntrospection && hasKeyDirective;
}

function getDirectivesByName(name: string, node: ObjectTypeDefinitionNode | GraphQLObjectType | FieldDefinitionNode): readonly DirectiveNode[] {
  let astNode: ObjectTypeDefinitionNode | FieldDefinitionNode;

  if (isObjectType(node)) {
    astNode = node.astNode;
  } else {
    astNode = node;
  }

  if (astNode && astNode.directives) {
    return astNode.directives.filter(d => d.name.value === name);
  }

  return [];
}

export function isExternalAndNotProvided(fieldNode: FieldDefinitionNode, objectType: GraphQLObjectType, providesMap: Record<string, string[]>): boolean {
  return isExternal(fieldNode) && !hasProvides(objectType, fieldNode, providesMap);
}

export function isExternal(node: FieldDefinitionNode): boolean {
  return getDirectivesByName('external', node).length > 0;
}

export function hasProvides(objectType: ObjectTypeDefinitionNode | GraphQLObjectType, node: FieldDefinitionNode, providesMap: Record<string, string[]>): boolean {
  const fields = providesMap[isObjectType(objectType) ? objectType.name : objectType.name.value];

  if (fields && fields.length) {
    return fields.includes(node.name.value);
  }

  return false;
}

function extractFieldSet(directive: DirectiveNode): string[] {
  const arg = directive.arguments.find(arg => arg.name.value === 'fields');

  return deduplicate((arg.value as StringValueNode).value.split(/\s+/g));
}

function translateFieldSet(fields: Array<{ name: string; required?: boolean }>, parentTypeRef: string): string {
  // TODO: support other things than fields separated by a whitespace (fields: "fieldA fieldB fieldC")
  const inner = fields.map(field => `${field.name}${field.required ? '' : '?'}: ${parentTypeRef}['${field.name}']`).join('; ');
  return `{ ${inner} }`;
}

function createMapOfProvides(schema: GraphQLSchema) {
  const providesMap: Record<string, string[]> = {};

  Object.keys(schema.getTypeMap()).forEach(typename => {
    const objectType = schema.getType(typename);

    if (isObjectType(objectType)) {
      Object.values(objectType.getFields()).forEach(field => {
        const provides = getDirectivesByName('provides', field.astNode)
          .map(extractFieldSet)
          .reduce((prev, curr) => [...prev, ...curr], []);
        const ofType = getBaseType(field.type);

        if (!providesMap[ofType.name]) {
          providesMap[ofType.name] = [];
        }

        providesMap[ofType.name].push(...provides);
      });
    }
  });

  return providesMap;
}
