import {
  GraphQLSchema,
  isWrappingType,
  GraphQLWrappingType,
  TypeNode,
  GraphQLAbstractType,
  GraphQLObjectType,
  Kind,
} from 'graphql';

import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { UrqlGraphCacheConfig } from './config';
import { convertFactory, ConvertFn } from '@graphql-codegen/visitor-plugin-common';

type GraphQLFlatType = Exclude<TypeNode, GraphQLWrappingType>;

const unwrapType = (type: null | undefined | TypeNode): GraphQLFlatType | null =>
  isWrappingType(type) ? unwrapType(type.ofType as any) : type || null;

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

function constructType(
  typeNode: TypeNode,
  schema: GraphQLSchema,
  convertName: ConvertFn,
  config: UrqlGraphCacheConfig,
  nullable = true,
  allowString = false
): string {
  switch (typeNode.kind) {
    case Kind.LIST_TYPE: {
      return nullable
        ? `Maybe<Array<${constructType(typeNode.type, schema, convertName, config, false, allowString)}>>`
        : `Array<${constructType(typeNode.type, schema, convertName, config, false, allowString)}>`;
    }

    case Kind.NAMED_TYPE: {
      const type = schema.getType(typeNode.name.value);
      if (!type.astNode || type?.astNode?.kind === 'ScalarTypeDefinition') {
        return nullable
          ? `Maybe<Scalars['${type.name}']${allowString ? ' | string' : ''}>`
          : `Scalars['${type.name}']${allowString ? ' | string' : ''}`;
      }

      const tsTypeName = convertName(typeNode, { prefix: config.typesPrefix, suffix: config.typesSuffix });
      switch (type.astNode.kind) {
        case Kind.UNION_TYPE_DEFINITION:
        case Kind.INPUT_OBJECT_TYPE_DEFINITION:
        case Kind.OBJECT_TYPE_DEFINITION: {
          const finalType = `WithTypename<${tsTypeName}>${allowString ? ' | string' : ''}`;
          return nullable ? `Maybe<${finalType}>` : finalType;
        }

        case Kind.ENUM_TYPE_DEFINITION: {
          const finalType = `${tsTypeName}${allowString ? ' | string' : ''}`;
          return nullable ? `Maybe<${finalType}>` : finalType;
        }

        case Kind.INTERFACE_TYPE_DEFINITION: {
          const possibleTypes = schema.getPossibleTypes(type as GraphQLAbstractType).map(possibleType => {
            const tsPossibleTypeName = convertName(possibleType.astNode, {
              prefix: config.typesPrefix,
              suffix: config.typesSuffix,
            });
            return `WithTypename<${tsPossibleTypeName}>`;
          });
          const finalType = allowString ? possibleTypes.join(' | ') + ' | string' : possibleTypes.join(' | ');
          return nullable ? `Maybe<${finalType}>` : finalType;
        }
      }

      break;
    }

    case Kind.NON_NULL_TYPE: {
      return constructType(typeNode.type, schema, convertName, config, false, allowString);
    }
  }
}

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

function getKeysConfig(schema: GraphQLSchema, convertName: ConvertFn, config: UrqlGraphCacheConfig) {
  const keys = getObjectTypes(schema).reduce((keys, type) => {
    keys.push(
      `${type.name}?: (data: WithTypename<${convertName(type.astNode, {
        prefix: config.typesPrefix,
        suffix: config.typesSuffix,
      })}>) => null | string`
    );
    return keys;
  }, []);

  return 'export type GraphCacheKeysConfig = {\n  ' + keys.join(',\n  ') + '\n}';
}

function getResolversConfig(schema: GraphQLSchema, convertName: ConvertFn, config: UrqlGraphCacheConfig) {
  const objectTypes = [schema.getQueryType(), ...getObjectTypes(schema)];

  const resolvers = objectTypes.reduce((resolvers, parentType) => {
    const fields = parentType.astNode.fields.reduce((fields, field) => {
      const argsName = field.arguments?.length
        ? convertName(`${parentType.name}${capitalize(field.name.value)}Args`, {
            prefix: config.typesPrefix,
            suffix: config.typesSuffix,
          })
        : 'Record<string, never>';
      const type = unwrapType(field.type);

      fields.push(
        `${field.name.value}?: GraphCacheResolver<WithTypename<` +
          `${convertName(parentType.astNode, {
            prefix: config.typesPrefix,
            suffix: config.typesSuffix,
          })}>, ${argsName}, ` +
          `${constructType(type, schema, convertName, config, false, true)}>`
      );

      return fields;
    }, []);

    resolvers.push(`  ${parentType.name}?: {\n    ` + fields.join(',\n    ') + '\n  }');

    return resolvers;
  }, []);

  return resolvers;
}

function getRootUpdatersConfig(schema: GraphQLSchema, convertName: ConvertFn, config: UrqlGraphCacheConfig) {
  const [mutationUpdaters, subscriptionUpdaters] = [schema.getMutationType(), schema.getSubscriptionType()].map(
    rootType => {
      if (rootType) {
        const updaters: string[] = [];
        const { fields } = rootType.astNode;

        fields.forEach(fieldNode => {
          const argsName = fieldNode.arguments?.length
            ? convertName(`${rootType.name}${capitalize(fieldNode.name.value)}Args`, {
                prefix: config.typesPrefix,
                suffix: config.typesSuffix,
              })
            : 'Record<string, never>';

          const type = unwrapType(fieldNode.type);
          updaters.push(
            `${fieldNode.name.value}?: GraphCacheUpdateResolver<{ ${fieldNode.name.value}: ${constructType(
              type,
              schema,
              convertName,
              config
            )} }, ${argsName}>`
          );
        });

        return updaters;
      } else {
        return null;
      }
    }
  );
  return {
    mutationUpdaters,
    subscriptionUpdaters,
  };
}

function getOptimisticUpdatersConfig(
  schema: GraphQLSchema,
  convertName: ConvertFn,
  config: UrqlGraphCacheConfig
): string[] | null {
  const mutationType = schema.getMutationType();
  if (mutationType) {
    const optimistic: string[] = [];
    const { fields } = mutationType.astNode;

    fields.forEach(fieldNode => {
      const argsName = fieldNode.arguments?.length
        ? convertName(`Mutation${capitalize(fieldNode.name.value)}Args`, {
            prefix: config.typesPrefix,
            suffix: config.typesSuffix,
          })
        : 'Record<string, never>';
      const type = unwrapType(fieldNode.type);
      const outputType = constructType(type, schema, convertName, config);
      optimistic.push(
        `${fieldNode.name.value}?: GraphCacheOptimisticMutationResolver<` + `${argsName}, ` + `${outputType}>`
      );
    });

    return optimistic;
  } else {
    return null;
  }
}

function getImports(config: UrqlGraphCacheConfig): string {
  return (
    `${
      config.useTypeImports ? 'import type' : 'import'
    } { Resolver as GraphCacheResolver, UpdateResolver as GraphCacheUpdateResolver, OptimisticMutationResolver as GraphCacheOptimisticMutationResolver, StorageAdapter as GraphCacheStorageAdapter } from '@urql/exchange-graphcache';\n` +
    `${
      config.useTypeImports ? 'import type' : 'import'
    } { IntrospectionData } from '@urql/exchange-graphcache/dist/types/ast';`
  );
}

export const plugin: PluginFunction<UrqlGraphCacheConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  _documents,
  config
) => {
  const convertName = convertFactory(config);
  const imports = getImports(config);
  const keys = getKeysConfig(schema, convertName, config);
  const resolvers = getResolversConfig(schema, convertName, config);
  const { mutationUpdaters, subscriptionUpdaters } = getRootUpdatersConfig(schema, convertName, config);
  const optimisticUpdaters = getOptimisticUpdatersConfig(schema, convertName, config);

  return {
    prepend: [imports],
    content: [
      `export type WithTypename<T extends { __typename?: any }> = { [K in Exclude<keyof T, '__typename'>]?: T[K] } & { __typename: NonNullable<T['__typename']> };`,

      keys,

      'export type GraphCacheResolvers = {\n' + resolvers.join(',\n') + '\n};',

      'export type GraphCacheOptimisticUpdaters = {\n  ' +
        (optimisticUpdaters ? optimisticUpdaters.join(',\n  ') : '{}') +
        '\n};',

      'export type GraphCacheUpdaters = {\n' +
        '  Mutation?: ' +
        (mutationUpdaters ? `{\n    ${mutationUpdaters.join(',\n    ')}\n  }` : '{}') +
        ',\n' +
        '  Subscription?: ' +
        (subscriptionUpdaters ? `{\n    ${subscriptionUpdaters.join(',\n    ')}\n  }` : '{}') +
        ',\n};',

      'export type GraphCacheConfig = {\n' +
        '  schema?: IntrospectionData,\n' +
        '  updates?: GraphCacheUpdaters,\n' +
        '  keys?: GraphCacheKeysConfig,\n' +
        '  optimistic?: GraphCacheOptimisticUpdaters,\n' +
        '  resolvers?: GraphCacheResolvers,\n' +
        '  storage?: GraphCacheStorageAdapter\n' +
        '};',
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
};
