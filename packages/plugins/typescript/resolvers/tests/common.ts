import { validateTs } from '@graphql-codegen/testing';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { buildSchema } from 'graphql';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';

export const schema = buildSchema(/* GraphQL */ `
  type MyType {
    foo: String!
    otherType: MyOtherType
    withArgs(arg: String, arg2: String!): String
  }

  type MyOtherType {
    bar: String!
  }

  type Query {
    something: MyType!
  }

  type Subscription {
    somethingChanged: MyOtherType
  }

  interface Node {
    id: ID!
  }

  type SomeNode implements Node {
    id: ID!
  }

  union MyUnion = MyType | MyOtherType

  scalar MyScalar

  directive @myDirective(arg: Int!, arg2: String!, arg3: Boolean!) on FIELD
`);

export const validate = async (
  content: Types.PluginOutput,
  config: any = {},
  pluginSchema = schema,
  additionalCode = ''
) => {
  const mergedContent = mergeOutputs([
    await tsPlugin(pluginSchema, [], config, { outputFile: '' }),
    content,
    additionalCode,
  ]);

  validateTs(mergedContent);

  return mergedContent;
};
