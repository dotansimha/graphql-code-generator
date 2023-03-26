import { mergeOutputs, Types } from '@graphql-codegen/plugin-helpers';
import { validateTs } from '@graphql-codegen/testing';
import { plugin as tsPlugin } from '@graphql-codegen/typescript';
import { buildSchema } from 'graphql';

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

  interface AnotherNode {
    id: ID!
  }

  interface WithChild {
    unionChild: ChildUnion
    node: AnotherNode
  }

  interface WithChildren {
    unionChildren: [ChildUnion!]!
    nodes: [AnotherNode!]!
  }

  type AnotherNodeWithChild implements AnotherNode & WithChild {
    id: ID!
    unionChild: ChildUnion
    interfaceChild: Node
  }

  type AnotherNodeWithAll implements AnotherNode & WithChild & WithChildren {
    id: ID!
    unionChild: ChildUnion
    unionChildren: [ChildUnion!]!
    interfaceChild: Node
    interfaceChildren: [Node!]!
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
