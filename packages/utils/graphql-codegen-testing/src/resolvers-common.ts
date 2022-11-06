import { validateTs } from '@graphql-codegen/testing';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { buildSchema } from 'graphql';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';

export const resolversTestingSchema = buildSchema(/* GraphQL */ `
  type MyType {
    foo: String! @authenticated
    otherType: MyOtherType
    withArgs(arg: String, arg2: String!): String
    unionChild: ChildUnion
  }

  type Child {
    bar: String!
    parent: MyType
  }

  type MyOtherType {
    bar: String!
  }

  union ChildUnion = Child | MyOtherType

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
  directive @authenticated on FIELD_DEFINITION
`);

export const resolversTestingValidate = async (
  content: Types.PluginOutput,
  config: any = {},
  pluginSchema = resolversTestingSchema,
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
