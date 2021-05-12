import {
  GraphQLSchema,
  isWrappingType,
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
    if (!typeMap[key] || !typeMap[key].name) continue;

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
          const finalType = `WithTypename<${typeNode.name.value}>${allowString ? ' | string' : ''}`;
          return nullable ? `Maybe<${finalType}>` : finalType;
        }

        case 'InterfaceTypeDefinition': {
          const possibleTypes = schema.getPossibleTypes(type as GraphQLAbstractType).map(function contruct(x) {
            return `WithTypename<${x}>`;
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
    keys.push(`${type.name}?: (data: WithTypename<${type.name}>) => null | string`);
    return keys;
  }, []);

  return 'type GraphCacheKeysConfig = {\n  ' + keys.join(',\n  ') + '\n}';
}

function getResolversConfig(schema: GraphQLSchema) {
  const objectTypes = [schema.getQueryType(), ...getObjectTypes(schema)];

  const resolvers = objectTypes.reduce((resolvers, parentType) => {
    const fields = parentType.astNode.fields.reduce((fields, field) => {
      const argsName =
        field.arguments && field.arguments.length ? `${parentType.name}${capitalize(field.name.value)}Args` : 'null';
      const type = unwrapType(field.type);

      fields.push(
        `${field.name.value}?: GraphCacheResolver<WithTypename<` +
          `${parentType.name}>, ${argsName}, ` +
          `${constructType(type, schema, false, true)}>`
      );

      return fields;
    }, []);

    resolvers.push(`  ${parentType.name}?: {\n    ` + fields.join(',\n    ') + '\n  }');

    return resolvers;
  }, []);

  return resolvers;
}

function getSubscriptionUpdatersConfig(schema: GraphQLSchema): string[] | null {
  const subscriptionType = schema.getSubscriptionType();
  if (subscriptionType) {
    const updaters: string[] = [];
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

    return updaters;
  } else {
    return null;
  }
}

function getMutationUpdaterConfig(schema: GraphQLSchema): string[] | null {
  const mutationType = schema.getMutationType();
  if (mutationType) {
    const updaters: string[] = [];
    const { fields } = mutationType.astNode;

    fields.forEach(fieldNode => {
      const argsName = `Mutation${capitalize(fieldNode.name.value)}Args`;
      const type = unwrapType(fieldNode.type);

      updaters.push(
        `${fieldNode.name.value}?: GraphCacheUpdateResolver<{ ` +
          `${fieldNode.name.value}: ` +
          `${constructType(type, schema)} }, ` +
          `${argsName}>`
      );
    });

    return updaters;
  } else {
    return null;
  }
}

function getOptimisticUpdatersConfig(schema: GraphQLSchema): string[] | null {
  const mutationType = schema.getMutationType();
  if (mutationType) {
    const optimistic: string[] = [];
    const { fields } = mutationType.astNode;

    fields.forEach(fieldNode => {
      const argsName = `Mutation${capitalize(fieldNode.name.value)}Args`;
      const type = unwrapType(fieldNode.type);
      const outputType = constructType(type, schema);
      optimistic.push(
        `${fieldNode.name.value}?: GraphCacheOptimisticMutationResolver<` + `${argsName}, ` + `${outputType}>`
      );
    });

    return optimistic;
  } else {
    return null;
  }
}

export const plugin: PluginFunction<UrqlGraphCacheConfig, Types.ComplexPluginOutput> = (schema: GraphQLSchema) => {
  const keys = getKeysConfig(schema);
  const resolvers = getResolversConfig(schema);
  const mutationUpdaters = getMutationUpdaterConfig(schema);
  const optimisticUpdaters = getOptimisticUpdatersConfig(schema);
  const subscriptionUpdaters = getSubscriptionUpdatersConfig(schema);

  return {
    prepend: [imports],
    content: [
      `type WithTypename<T extends { __typename?: any }> = { [K in Exclude<keyof T, '__typename'>]?: T[K] } & { __typename: NonNullable<T['__typename']> };`,

      keys,

      'type GraphCacheResolvers = {\n' + resolvers.join(',\n') + '\n};',

      'type GraphCacheOptimisticUpdaters = {\n  ' +
        (optimisticUpdaters ? optimisticUpdaters.join(',\n  ') : '{}') +
        '\n};',

      'type GraphCacheUpdaters = {\n' +
        '  Mutation?: ' +
        (mutationUpdaters ? `{\n    ${mutationUpdaters.join(',\n    ')}\n  }` : '{}') +
        ',\n' +
        '  Subscription?: ' +
        (subscriptionUpdaters ? `{\n    ${subscriptionUpdaters.join(',\n    ')}\n  }` : '{}') +
        ',\n};',

      'export type GraphCacheConfig = {\n' +
        '  updates: GraphCacheUpdaters,\n' +
        '  keys: GraphCacheKeysConfig,\n' +
        '  optimistic: GraphCacheOptimisticUpdaters,\n' +
        '  resolvers: GraphCacheResolvers\n' +
        '};',
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
};
