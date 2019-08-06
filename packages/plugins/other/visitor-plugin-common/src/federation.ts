import { GraphQLSchema, visit, parse, buildASTSchema, FieldDefinitionNode, Kind, ObjectTypeDefinitionNode, DirectiveNode, StringValueNode, GraphQLObjectType, isObjectType, isNonNullType, GraphQLNamedType } from 'graphql';
import { printSchemaWithDirectives } from 'graphql-toolkit';
import { getBaseType } from './utils';

interface FieldSetItem {
  name: string;
  required: boolean;
}

// TODO: we need to include that scala
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

  return buildASTSchema(visited, {
    assumeValidSDL: true,
  });
}

export class ApolloFederation {
  private enabled = false;
  private schema: GraphQLSchema;
  private providesMap: Record<string, string[]>;

  constructor({ enabled, schema }: { enabled: boolean; schema: GraphQLSchema }) {
    this.enabled = enabled;
    this.schema = schema;
    this.providesMap = this.createMapOfProvides();
  }

  filterTypeNames(typeNames: string[]): string[] {
    return this.enabled ? typeNames.filter(t => t !== '_FieldSet') : typeNames;
  }

  filterFieldNames(fieldNames: string[]): string[] {
    return this.enabled ? fieldNames.filter(t => t !== '__resolveReference') : fieldNames;
  }

  skipDirective(name: string): boolean {
    return this.enabled && ['external', 'requires', 'provides', 'key'].includes(name);
  }

  skipScalar(name: string): boolean {
    return this.enabled && name === '_FieldSet';
  }

  skipField({ fieldNode, parentType }: { fieldNode: FieldDefinitionNode; parentType: GraphQLNamedType }): boolean {
    if (!this.enabled || !isObjectType(parentType) || !isFederationObjectType(parentType)) {
      return false;
    }

    return this.isExternalAndNotProvided(fieldNode, parentType);
  }

  translateParentType({ fieldNode, parentType, parentTypeSignature }: { fieldNode: FieldDefinitionNode; parentType: GraphQLNamedType; parentTypeSignature: string }) {
    if (this.enabled && isObjectType(parentType) && isFederationObjectType(parentType)) {
      const keys = getDirectivesByName('key', parentType);

      if (keys.length) {
        const outputs: string[] = [];

        // Look for @requires and see what the service needs and gets
        const requires = getDirectivesByName('requires', fieldNode)
          .map(this.extractFieldSet)
          .reduce((prev, curr) => [...prev, ...curr], [])
          .map(name => {
            return { name, required: isNonNullType(parentType.getFields()[name].type) };
          });
        const requiredFields = this.translateFieldSet(requires, parentTypeSignature);

        // @key() @key() - "primary keys" in Federation
        const primaryKeys = keys.map(def => {
          const fields = this.extractFieldSet(def).map(name => ({ name, required: true }));
          return this.translateFieldSet(fields, parentTypeSignature);
        });

        const [open, close] = primaryKeys.length > 1 ? ['(', ')'] : ['', ''];

        outputs.push([open, primaryKeys.join(' | '), close].join(''));

        // include required fields
        if (requires.length) {
          outputs.push(`& ${requiredFields}`);
        }

        return outputs.join(' ');
      }
    }

    return parentTypeSignature;
  }

  private isExternalAndNotProvided(fieldNode: FieldDefinitionNode, objectType: GraphQLObjectType): boolean {
    return this.isExternal(fieldNode) && !this.hasProvides(objectType, fieldNode);
  }

  private isExternal(node: FieldDefinitionNode): boolean {
    return getDirectivesByName('external', node).length > 0;
  }

  private hasProvides(objectType: ObjectTypeDefinitionNode | GraphQLObjectType, node: FieldDefinitionNode): boolean {
    const fields = this.providesMap[isObjectType(objectType) ? objectType.name : objectType.name.value];

    if (fields && fields.length) {
      return fields.includes(node.name.value);
    }

    return false;
  }

  private translateFieldSet(fields: FieldSetItem[], parentTypeRef: string): string {
    // TODO: support other things than fields separated by a whitespace (fields: "fieldA fieldB fieldC")
    const keys = fields.map(field => `'${field.name}'`).join(' | ');
    return `Pick<${parentTypeRef}, ${keys}>`;
  }

  private extractFieldSet(directive: DirectiveNode): string[] {
    const arg = directive.arguments.find(arg => arg.name.value === 'fields');
    const value = (arg.value as StringValueNode).value;

    if (/[\{\}]+/gi.test(value)) {
      throw new Error('Nested fields in _FieldSet is not supported');
    }

    return deduplicate(value.split(/\s+/g));
  }

  private createMapOfProvides() {
    const providesMap: Record<string, string[]> = {};

    Object.keys(this.schema.getTypeMap()).forEach(typename => {
      const objectType = this.schema.getType(typename);

      if (isObjectType(objectType)) {
        Object.values(objectType.getFields()).forEach(field => {
          const provides = getDirectivesByName('provides', field.astNode)
            .map(this.extractFieldSet)
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
}

function isFederationObjectType(node: ObjectTypeDefinitionNode | GraphQLObjectType): boolean {
  const name = isObjectType(node) ? node.name : node.name.value;
  const directives = isObjectType(node) ? node.astNode.directives : node.directives;

  const isNotRoot = !['Query', 'Mutation', 'Subscription'].includes(name);
  const isNotIntrospection = !name.startsWith('__');
  const hasKeyDirective = directives.some(d => d.name.value === 'key');

  return isNotRoot && isNotIntrospection && hasKeyDirective;
}

function deduplicate<T>(items: T[]): T[] {
  return items.filter((item, i) => items.indexOf(item) === i);
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
