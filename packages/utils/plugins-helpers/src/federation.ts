import { astFromInterfaceType, astFromObjectType, getRootTypeNames, MapperKind, mapSchema } from '@graphql-tools/utils';
import {
  DefinitionNode,
  DirectiveNode,
  FieldDefinitionNode,
  GraphQLInterfaceType,
  GraphQLNamedType,
  GraphQLObjectType,
  GraphQLSchema,
  isInterfaceType,
  isObjectType,
  ObjectTypeDefinitionNode,
  OperationDefinitionNode,
  parse,
  StringValueNode,
} from 'graphql';
import merge from 'lodash/merge.js';
import { oldVisit } from './index.js';
import { getBaseType } from './utils.js';

/**
 * Federation Spec
 */
export const federationSpec = parse(/* GraphQL */ `
  scalar _FieldSet

  directive @external on FIELD_DEFINITION
  directive @requires(fields: _FieldSet!) on FIELD_DEFINITION
  directive @provides(fields: _FieldSet!) on FIELD_DEFINITION
  directive @key(fields: _FieldSet!) on OBJECT | INTERFACE
`);

interface TypeMeta {
  hasResolveReference: boolean;
  resolvableKeyDirectives: readonly DirectiveNode[];
}

export type FederationMeta = { [typeName: string]: TypeMeta };

/**
 * Adds `__resolveReference` in each ObjectType and InterfaceType involved in Federation.
 * We do this to utilise the existing FieldDefinition logic of the plugin, which includes many logic:
 * - mapper
 * - return type
 * @param schema
 */
export function addFederationReferencesToSchema(schema: GraphQLSchema): {
  transformedSchema: GraphQLSchema;
  federationMeta: FederationMeta;
} {
  const setFederationMeta = ({
    meta,
    typeName,
    update,
  }: {
    meta: FederationMeta;
    typeName: string;
    update: TypeMeta;
  }): void => {
    meta[typeName] = { ...(meta[typeName] || { hasResolveReference: false, resolvableKeyDirectives: [] }), ...update };
  };

  const federationMeta: FederationMeta = {};

  const transformedSchema = mapSchema(schema, {
    [MapperKind.INTERFACE_TYPE]: type => {
      const federationDetails = checkTypeFederationDetails(type, schema);
      if (federationDetails && federationDetails.resolvableKeyDirectives.length > 0) {
        const typeConfig = type.toConfig();
        typeConfig.fields = {
          [resolveReferenceFieldName]: {
            type,
          },
          ...typeConfig.fields,
        };

        setFederationMeta({
          meta: federationMeta,
          typeName: type.name,
          update: {
            hasResolveReference: true,
            resolvableKeyDirectives: federationDetails.resolvableKeyDirectives,
          },
        });

        return new GraphQLInterfaceType(typeConfig);
      }

      return type;
    },
    [MapperKind.OBJECT_TYPE]: type => {
      const federationDetails = checkTypeFederationDetails(type, schema);
      if (federationDetails && federationDetails.resolvableKeyDirectives.length > 0) {
        const typeConfig = type.toConfig();
        typeConfig.fields = {
          [resolveReferenceFieldName]: {
            type,
          },
          ...typeConfig.fields,
        };

        setFederationMeta({
          meta: federationMeta,
          typeName: type.name,
          update: {
            hasResolveReference: true,
            resolvableKeyDirectives: federationDetails.resolvableKeyDirectives,
          },
        });

        return new GraphQLObjectType(typeConfig);
      }
      return type;
    },
  });

  return {
    transformedSchema,
    federationMeta,
  };
}

/**
 * Removes Federation Spec from GraphQL Schema
 * @param schema
 * @param config
 */
export function removeFederation(schema: GraphQLSchema): GraphQLSchema {
  return mapSchema(schema, {
    [MapperKind.QUERY]: queryType => {
      const queryTypeConfig = queryType.toConfig();
      delete queryTypeConfig.fields._entities;
      delete queryTypeConfig.fields._service;
      return new GraphQLObjectType(queryTypeConfig);
    },
    [MapperKind.UNION_TYPE]: unionType => {
      const unionTypeName = unionType.name;
      if (unionTypeName === '_Entity' || unionTypeName === '_Any') {
        return null;
      }
      return unionType;
    },
    [MapperKind.OBJECT_TYPE]: objectType => {
      if (objectType.name === '_Service') {
        return null;
      }
      return objectType;
    },
  });
}

const resolveReferenceFieldName = '__resolveReference';

export class ApolloFederation {
  private enabled = false;
  private schema: GraphQLSchema;
  private providesMap: Record<string, string[]>;
  protected meta: FederationMeta = {};

  constructor({ enabled, schema, meta }: { enabled: boolean; schema: GraphQLSchema; meta: FederationMeta }) {
    this.enabled = enabled;
    this.schema = schema;
    this.providesMap = this.createMapOfProvides();
    this.meta = meta;
  }

  /**
   * Excludes types definde by Federation
   * @param typeNames List of type names
   */
  filterTypeNames(typeNames: string[]): string[] {
    return this.enabled ? typeNames.filter(t => t !== '_FieldSet') : typeNames;
  }

  /**
   * Excludes `__resolveReference` fields
   * @param fieldNames List of field names
   */
  filterFieldNames(fieldNames: string[]): string[] {
    return this.enabled ? fieldNames.filter(t => t !== resolveReferenceFieldName) : fieldNames;
  }

  /**
   * Decides if directive should not be generated
   * @param name directive's name
   */
  skipDirective(name: string): boolean {
    return this.enabled && ['external', 'requires', 'provides', 'key'].includes(name);
  }

  /**
   * Decides if scalar should not be generated
   * @param name directive's name
   */
  skipScalar(name: string): boolean {
    return this.enabled && name === '_FieldSet';
  }

  /**
   * Decides if field should not be generated
   * @param data
   */
  skipField({ fieldNode, parentType }: { fieldNode: FieldDefinitionNode; parentType: GraphQLNamedType }): boolean {
    if (
      !this.enabled ||
      !(isObjectType(parentType) && !isInterfaceType(parentType)) ||
      !checkTypeFederationDetails(parentType, this.schema)
    ) {
      return false;
    }

    return this.isExternalAndNotProvided(fieldNode, parentType);
  }

  isResolveReferenceField(fieldNode: FieldDefinitionNode): boolean {
    const name = typeof fieldNode.name === 'string' ? fieldNode.name : fieldNode.name.value;
    return this.enabled && name === resolveReferenceFieldName;
  }

  /**
   * Transforms a field's ParentType signature in ObjectTypes or InterfaceTypes involved in Federation
   * @param data
   */
  transformFieldParentType({
    fieldNode,
    parentType,
    parentTypeSignature,
    federationTypeSignature,
  }: {
    fieldNode: FieldDefinitionNode;
    parentType: GraphQLNamedType;
    parentTypeSignature: string;
    federationTypeSignature: string;
  }) {
    if (!this.enabled) {
      return parentTypeSignature;
    }

    const parentTypeMeta = this.getMeta()[parentType.name];
    if (!parentTypeMeta?.hasResolveReference) {
      return parentTypeSignature;
    }

    const isObjectFieldWithFederationRef =
      isObjectType(parentType) &&
      (nodeHasTypeExtension(parentType, this.schema) || fieldNode.name.value === resolveReferenceFieldName);

    const isInterfaceFieldWithFederationRef =
      isInterfaceType(parentType) && fieldNode.name.value === resolveReferenceFieldName;

    if (!isObjectFieldWithFederationRef && !isInterfaceFieldWithFederationRef) {
      return parentTypeSignature;
    }

    const outputs: string[] = [`{ __typename: '${parentType.name}' } &`];

    // Look for @requires and see what the service needs and gets
    const requires = getDirectivesByName('requires', fieldNode).map(this.extractFieldSet);
    const requiredFields = this.translateFieldSet(merge({}, ...requires), federationTypeSignature);

    // @key() @key() - "primary keys" in Federation
    const primaryKeys = parentTypeMeta.resolvableKeyDirectives.map(def => {
      const fields = this.extractFieldSet(def);
      return this.translateFieldSet(fields, federationTypeSignature);
    });

    const [open, close] = primaryKeys.length > 1 ? ['(', ')'] : ['', ''];

    outputs.push([open, primaryKeys.join(' | '), close].join(''));

    // include required fields
    if (requires.length) {
      outputs.push(`& ${requiredFields}`);
    }

    return outputs.join(' ');
  }

  addFederationTypeGenericIfApplicable({
    genericTypes,
    typeName,
    federationTypesType,
  }: {
    genericTypes: string[];
    typeName: string;
    federationTypesType: string;
  }): void {
    if (!this.getMeta()[typeName]) {
      return;
    }

    const typeRef = `${federationTypesType}['${typeName}']`;
    genericTypes.push(`FederationType extends ${typeRef} = ${typeRef}`);
  }

  getMeta() {
    return this.meta;
  }

  private isExternalAndNotProvided(fieldNode: FieldDefinitionNode, objectType: GraphQLObjectType): boolean {
    return this.isExternal(fieldNode) && !this.hasProvides(objectType, fieldNode);
  }

  private isExternal(node: FieldDefinitionNode): boolean {
    return getDirectivesByName('external', node).length > 0;
  }

  private hasProvides(objectType: ObjectTypeDefinitionNode | GraphQLObjectType, node: FieldDefinitionNode): boolean {
    const fields = this.providesMap[isObjectType(objectType) ? objectType.name : objectType.name.value];

    if (fields?.length) {
      return fields.includes(node.name.value);
    }

    return false;
  }

  private translateFieldSet(fields: any, parentTypeRef: string): string {
    return `GraphQLRecursivePick<${parentTypeRef}, ${JSON.stringify(fields)}>`;
  }

  private extractFieldSet(directive: DirectiveNode): any {
    const arg = directive.arguments.find(arg => arg.name.value === 'fields');
    const { value } = arg.value as StringValueNode;

    type SelectionSetField = {
      name: string;
      selection: boolean | SelectionSetField[];
    };

    return oldVisit(parse(`{${value}}`), {
      leave: {
        SelectionSet(node) {
          return (node.selections as any as SelectionSetField[]).reduce((accum, field) => {
            accum[field.name] = field.selection;
            return accum;
          }, {});
        },
        Field(node) {
          return {
            name: node.name.value,
            selection: node.selectionSet || true,
          } as SelectionSetField;
        },
        Document(node) {
          return node.definitions.find(
            (def: DefinitionNode): def is OperationDefinitionNode =>
              def.kind === 'OperationDefinition' && def.operation === 'query'
          ).selectionSet;
        },
      },
    });
  }

  private createMapOfProvides() {
    const providesMap: Record<string, string[]> = {};

    for (const typename of Object.keys(this.schema.getTypeMap())) {
      const objectType = this.schema.getType(typename);

      if (isObjectType(objectType)) {
        for (const field of Object.values(objectType.getFields())) {
          const provides = getDirectivesByName('provides', field.astNode)
            .map(this.extractFieldSet)
            .reduce((prev, curr) => [...prev, ...Object.keys(curr)], []);
          const ofType = getBaseType(field.type);

          providesMap[ofType.name] ||= [];

          providesMap[ofType.name].push(...provides);
        }
      }
    }

    return providesMap;
  }
}

/**
 * Checks if Object Type is involved in Federation. Based on `@key` directive
 * @param node Type
 */
function checkTypeFederationDetails(
  node: ObjectTypeDefinitionNode | GraphQLObjectType | GraphQLInterfaceType,
  schema: GraphQLSchema
): { resolvableKeyDirectives: readonly DirectiveNode[] } | false {
  const {
    name: { value: name },
    directives,
  } = isObjectType(node)
    ? astFromObjectType(node, schema)
    : isInterfaceType(node)
    ? astFromInterfaceType(node, schema)
    : node;

  const rootTypeNames = getRootTypeNames(schema);
  const isNotRoot = !rootTypeNames.has(name);
  const isNotIntrospection = !name.startsWith('__');
  const keyDirectives = directives.filter(d => d.name.value === 'key');

  const check = isNotRoot && isNotIntrospection && keyDirectives.length > 0;

  if (!check) {
    return false;
  }

  const resolvableKeyDirectives = keyDirectives.filter(d => {
    for (const arg of d.arguments) {
      if (arg.name.value === 'resolvable' && arg.value.kind === 'BooleanValue' && arg.value.value === false) {
        return false;
      }
    }
    return true;
  });

  return { resolvableKeyDirectives };
}

/**
 * Extracts directives from a node based on directive's name
 * @param name directive name
 * @param node ObjectType or Field
 */
function getDirectivesByName(
  name: string,
  node: ObjectTypeDefinitionNode | GraphQLObjectType | FieldDefinitionNode
): readonly DirectiveNode[] {
  let astNode: ObjectTypeDefinitionNode | FieldDefinitionNode;

  if (isObjectType(node)) {
    astNode = node.astNode;
  } else {
    astNode = node;
  }

  return astNode?.directives?.filter(d => d.name.value === name) || [];
}

/**
 * Checks if the Object Type extends a federated type from a remote schema.
 * Based on if any of its fields contain the `@external` directive
 * @param node Type
 */
function nodeHasTypeExtension(node: ObjectTypeDefinitionNode | GraphQLObjectType, schema: GraphQLSchema): boolean {
  const definition = isObjectType(node) ? node.astNode || astFromObjectType(node, schema) : node;
  return definition.fields?.some(field => getDirectivesByName('external', field).length);
}
