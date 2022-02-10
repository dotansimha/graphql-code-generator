import { GraphQLBoolean, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { buildInterfaceArgumentString } from './buildInterfaceArgumentString';

describe('buildInterfaceArgumentString', () => {
  it('single interface member', () => {
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

    expect(buildInterfaceArgumentString(schema, interfaceType)).toMatchInlineSnapshot(`
      "type GeneratedSDKArgumentsFoo = SDKSelectionSet<{
        \\"...Hee\\": GeneratedSDKArgumentsHee;
      }>;"
    `);
  });
  it('multiple interface member', () => {
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

    expect(buildInterfaceArgumentString(schema, interfaceType)).toMatchInlineSnapshot(`
      "type GeneratedSDKArgumentsFoo = SDKSelectionSet<{
        \\"...Hee\\": GeneratedSDKArgumentsHee;
        \\"...Hoo\\": GeneratedSDKArgumentsHoo;
      }>;"
    `);
  });
});
