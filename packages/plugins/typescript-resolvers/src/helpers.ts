import { SafeString } from 'handlebars';
import { Field, Type, Interface, Union } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import { convertedType, getFieldType as fieldType } from 'graphql-codegen-typescript-common';
import { pickMapper, useDefaultMapper } from './mappers';

export function importFromGraphQL(options: Handlebars.HelperOptions) {
  const imports: string[] = ['GraphQLResolveInfo'];

  if (options.data.root.hasScalars) {
    imports.push('GraphQLScalarType', 'GraphQLScalarTypeConfig');
  }

  return `import { ${imports.join(', ')} } from 'graphql';`;
}

export const getFieldType = convert => (field: Field, options: Handlebars.HelperOptions) => {
  const config = options.data.root.config || {};
  const mapper = pickMapper(field.type, config.mappers || {}, options);
  const defaultMapper = useDefaultMapper(field, options);

  if (mapper) {
    return fieldType(field, mapper.type, options, true);
  }

  if (defaultMapper) {
    return fieldType(field, defaultMapper.type, options, true);
  }

  return convertedType(field, options, convert, undefined, true);
};

export const getFieldResolverName = (convert, config) => (name: string) => {
  return `${config.fieldResolverNamePrefix || ''}${convert(name)}Resolver`;
};

export const getFieldResolver = convert => (field: Field, type: Type, options: Handlebars.HelperOptions) => {
  if (!field) {
    return '';
  }

  let resolver: string;
  const config = options.data.root.config || {};
  const schema: GraphQLSchema = options.data.root.rawSchema;
  const subscriptionType = schema.getSubscriptionType();
  const isSubscription = subscriptionType && subscriptionType.name === type.name;

  if (isSubscription) {
    resolver = 'SubscriptionResolver';
  } else {
    resolver = 'Resolver';
  }

  const generics: string[] = ['R', 'Parent', 'TContext'];

  if (field.hasArguments) {
    const prefix = config.noNamespaces ? convert(type.name, 'typeNames') : '';
    generics.push(`${prefix}${convert(field.name)}Args`);
  }

  return new SafeString(`${resolver}<${generics.join(', ')}>`);
};

export function getTypenames(entity: Interface | Union): string {
  let types: string[] = [];

  if (isInterface(entity)) {
    types = entity.implementingTypes;
  } else {
    types = entity.possibleTypes;
  }

  return types.map(t => `'${t}'`).join(' | ');
}

export function isInterface(entity: any): entity is Interface {
  return typeof (entity as Interface).implementingTypes !== 'undefined';
}
