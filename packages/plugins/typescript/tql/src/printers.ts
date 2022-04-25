import { convertFactory } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLInputType, GraphQLScalarType, GraphQLEnumType, GraphQLInputObjectType } from 'graphql';

import { inputType, listType, toPrimitive } from './utils';

const factory = convertFactory({});

export const printInputType = (type: GraphQLInputType): string => {
  const isList = listType(type);
  const base = inputType(type);

  return (
    (() => {
      if (base instanceof GraphQLScalarType) {
        return toPrimitive(base);
      } else if (base instanceof GraphQLEnumType) {
        return factory(base.name);
      } else if (base instanceof GraphQLInputObjectType) {
        return factory(base.name);
      } else {
        throw new Error('Unable to render inputType.');
      }
    })() + (isList ? '[]' : '')
  );
};
