import {
  GraphQLSchema,
  isWrappingType,
  Kind,
  GraphQLWrappingType,
  TypeNode,
  GraphQLAbstractType,
  GraphQLObjectType,
} from 'graphql';

import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { UrqlGraphCacheConfig } from './config';
import { imports } from './constants';

type GraphQLFlatType = Exclude<TypeNode, GraphQLWrappingType>;

const unwrapType = (type: null | undefined | TypeNode): GraphQLFlatType | null =>
  isWrappingType(type) ? unwrapType(type.ofType) : type || null;

const getObjectTypes = (schema: GraphQLSchema): GraphQLObjectType[] => {
  const typeMap = schema.getTypeMap();
  const queryType = schema.getQueryType();
  const mutationType = schema.getMutationType();
  const subscriptionType = schema.getSubscriptionType();

  const objectTypes: GraphQLObjectType[] = [];

  for (const key in typeMap) {
    if (!typeMap.hasOwnProperty(key)) continue;

    const type = typeMap[key];
    switch (type.name) {
      case '__Directive':
      case '__DirectiveLocation':
      case '__EnumValue':
      case '__InputValue':
      case '__Field':
      case '__Type':
      case '__TypeKind':
      case '__Schema':
        continue;
      default:
        if (!(type instanceof GraphQLObjectType)) continue;
    }

    if (type !== queryType && type !== mutationType && type !== subscriptionType) {
      objectTypes.push(type);
    }
  }

  return objectTypes;
};

function constructType(typeNode: TypeNode, schema: GraphQLSchema, nullable = true, allowString = false): string {
  switch (typeNode.kind) {
    case 'ListType': {
      return nullable
        ? `Maybe<Array<${constructType(typeNode.type, schema, false, allowString)}>>`
        : `Array<${constructType(typeNode.type, schema, false, allowString)}>`;
    }

    case 'NamedType': {
      const type = schema.getType(typeNode.name.value);
      if (!type.astNode) {
        return nullable ? `Maybe<Scalars['${typeNode.name.value}']}>` : `Scalars['${typeNode.name.value}']`;
      }

      switch (type.astNode.kind) {
        case 'EnumTypeDefinition':
        case 'UnionTypeDefinition':
        case 'InputObjectTypeDefinition':
        case 'ObjectTypeDefinition':
        case 'ScalarTypeDefinition': {
          const finalType = `RequireFields<${typeNode.name.value}, '__typename'>${allowString ? ' | string' : ''}`;
          return nullable ? `Maybe<${finalType}>` : finalType;
        }

        case 'InterfaceTypeDefinition': {
          const possibleTypes = schema.getPossibleTypes(type as GraphQLAbstractType).map(function contruct(x) {
            return `RequireFields<${x}, '__typename'>`;
          });
          const finalType = allowString ? possibleTypes.join(' | ') + ' | string' : possibleTypes.join(' | ');
          return nullable ? `Maybe<${finalType}>` : finalType;
        }
      }

      break;
    }

    case 'NonNullType': {
      return constructType(typeNode.type, schema, false, allowString);
    }
  }
}

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

function getKeysConfig(schema: GraphQLSchema) {
  const keys = getObjectTypes(schema).reduce((keys, type) => {
    keys.push(`${type.name}?: (data: RequireFields<${type.name}, '__typename'>) => null | string`);
    return keys;
  }, []);

  return '\ntype GraphCacheKeysConfig = {\n  ' + keys.join('\n  ') + '\n}\n';
}

function getResolversConfig(schema: GraphQLSchema) {
  const objectTypes = [schema.getQueryType(), ...getObjectTypes(schema)];

  const resolvers = objectTypes.reduce((resolvers, parentType) => {
    const fields = parentType.astNode.fields.reduce((fields, field) => {
      const argsName =
        field.arguments && field.arguments.length ? `${parentType.name}${capitalize(field.name.value)}Args` : 'null';
      const type = unwrapType(field.type);

      fields.push(
        `${field.name.value}?: GraphCacheResolver<RequireFields<` +
          `${parentType.name}, '__typename'>, ${argsName}, ` +
          `${constructType(type, schema, false, true)}>`
      );

      return fields;
    }, []);

    resolvers.push(`${parentType.name}?: {\n` + fields.join('\n    ') + '\n  }');

    return resolvers;
  }, []);

  return resolvers;
}

function getSubscriptionUpdatersConfig(schema: GraphQLSchema, subscriptionName: string) {
  const updaters = [];
  const typemap = schema.getTypeMap();
  const subscriptionType = typemap[subscriptionName];

  if (subscriptionType.astNode.kind === Kind.OBJECT_TYPE_DEFINITION) {
    const { fields } = subscriptionType.astNode;
    fields.forEach(fieldNode => {
      const argsName = `Mutation${capitalize(fieldNode.name.value)}Args`;
      const type = unwrapType(fieldNode.type);
      updaters.push(
        `${fieldNode.name.value}?: GraphCacheUpdateResolver<{ ${fieldNode.name.value}: ${constructType(
          type,
          schema
        )} }, ${argsName}>`
      );
    });
  }

  return updaters;
}

function getMutationUpdaterConfig(schema: GraphQLSchema, mutationName: string) {
  const updaters = [];
  const typemap = schema.getTypeMap();
  const mutationType = typemap[mutationName];

  if (mutationType.astNode.kind === Kind.OBJECT_TYPE_DEFINITION) {
    const { fields } = mutationType.astNode;
    fields.forEach(fieldNode => {
      const argsName = `Mutation${capitalize(fieldNode.name.value)}Args`;
      const type = unwrapType(fieldNode.type);
      updaters.push(
        `${fieldNode.name.value}?: GraphCacheUpdateResolver<{ ${fieldNode.name.value}: ${constructType(
          type,
          schema
        )} }, ${argsName}>`
      );
    });
  }

  return updaters;
}

function getOptimisticUpdatersConfig(schema: GraphQLSchema, mutationName: string) {
  const optimistic = [];
  const typemap = schema.getTypeMap();
  const mutationType = typemap[mutationName];

  if (mutationType.astNode.kind === Kind.OBJECT_TYPE_DEFINITION) {
    const { fields } = mutationType.astNode;
    fields.forEach(fieldNode => {
      const argsName = `Mutation${capitalize(fieldNode.name.value)}Args`;
      const type = unwrapType(fieldNode.type);
      const outputType = constructType(type, schema);
      optimistic.push(`${fieldNode.name.value}?: GraphCacheOptimisticMutationResolver<${argsName}, ${outputType}>`);
    });
  }

  return optimistic;
}

function createCacheGeneric() {
  return `export type GraphCacheConfig = {
  updates: GraphCacheUpdaters;
  keys: GraphCacheKeysConfig;
  optimistic: GraphCacheOptimisticUpdaters;
  resolvers: GraphCacheResolvers;
}`;
}

export const plugin: PluginFunction<UrqlGraphCacheConfig, Types.ComplexPluginOutput> = (schema: GraphQLSchema) => {
  const mutationName = schema.getMutationType()?.name;
  const subscriptionsName = schema.getSubscriptionType()?.name;

  const keys = getKeysConfig(schema);
  const resolvers = getResolversConfig(schema);
  let mutationUpdaters, subscriptionUpaters, optimisticUpdaters;
  if (mutationName) {
    mutationUpdaters = getMutationUpdaterConfig(schema, mutationName);
    optimisticUpdaters = getOptimisticUpdatersConfig(schema, mutationName);
  }

  if (subscriptionsName) {
    subscriptionUpaters = getSubscriptionUpdatersConfig(schema, subscriptionsName);
  }

  return {
    prepend: [imports],
    content: [
      `type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };`,
      keys,
      `type GraphCacheResolvers = {
  ${resolvers.join('\n  ')}
}`,
      mutationName &&
        `type GraphCacheOptimisticUpdaters = {
  ${optimisticUpdaters.join('\n  ')}
}`,
      mutationName || subscriptionsName
        ? `type GraphCacheUpdaters = {
  Mutation?: ${
    mutationName
      ? `{
    ${mutationUpdaters.join('\n    ')}
  }`
      : '{}'
  }
  Subscription?: ${
    subscriptionsName
      ? `{
    ${subscriptionUpaters.join('\n    ')}
  }`
      : '{}'
  }
}`
        : null,
      createCacheGeneric(),
    ]
      .filter(Boolean)
      .join('\n'),
  };
};
