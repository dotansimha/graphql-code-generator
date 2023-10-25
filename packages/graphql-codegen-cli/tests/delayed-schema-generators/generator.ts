import { Types } from '@graphql-codegen/plugin-helpers';

export const generator: Types.DelayedSchemaGeneratorFunction = () => {
  return 'extend type Query { test: String! }';
};
