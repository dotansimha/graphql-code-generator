import { GraphQLBoolean, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { buildInterfaceSelectionString } from './buildInterfaceSelectionString';

describe('buildInterfaceSelectionString', () => {
  it('correct selection set for single interface member', () => {
    const interfaceType = new GraphQLInterfaceType({
      name: 'Foo',
      fields: {
        a: {
          type: GraphQLBoolean,
        },
      },
    });
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          a: {
            type: interfaceType,
          },
        },
      }),
      types: [
        new GraphQLObjectType({ name: 'Hee', fields: { a: { type: GraphQLBoolean } }, interfaces: [interfaceType] }),
      ],
    });

    expect(buildInterfaceSelectionString(schema, interfaceType)).toMatchInlineSnapshot(`
      "type GeneratedSDKSelectionSetFoo = SDKSelectionSet<{
        \\"...Hee\\": GeneratedSDKSelectionSetHee;
      }>;"
    `);
  });
  it('correct selection set for multi interface member', () => {
    const interfaceType = new GraphQLInterfaceType({
      name: 'Foo',
      fields: {
        a: {
          type: GraphQLBoolean,
        },
      },
    });
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          a: {
            type: interfaceType,
          },
        },
      }),
      types: [
        new GraphQLObjectType({ name: 'Hee', fields: { a: { type: GraphQLBoolean } }, interfaces: [interfaceType] }),
        new GraphQLObjectType({ name: 'Hoo', fields: { a: { type: GraphQLBoolean } }, interfaces: [interfaceType] }),
      ],
    });

    expect(buildInterfaceSelectionString(schema, interfaceType)).toMatchInlineSnapshot(`
      "type GeneratedSDKSelectionSetFoo = SDKSelectionSet<{
        \\"...Hee\\": GeneratedSDKSelectionSetHee;
        \\"...Hoo\\": GeneratedSDKSelectionSetHoo;
      }>;"
    `);
  });
});
