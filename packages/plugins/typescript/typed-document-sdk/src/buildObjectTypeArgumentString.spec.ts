import { GraphQLInt, GraphQLObjectType } from 'graphql';
import { buildObjectTypeArgumentString } from './buildObjectTypeArgumentString';

describe('buildObjectTypeArgumentString', () => {
  it('primitive field', () => {
    const graphQLObjectType = new GraphQLObjectType({
      name: 'Hello',
      fields: {
        a: {
          type: GraphQLInt,
        },
      },
    });

    expect(buildObjectTypeArgumentString(graphQLObjectType)).toMatchInlineSnapshot(`
      "type GeneratedSDKArgumentsHello = {
        a: {};
      };"
    `);
  });
  it('object field', () => {
    const graphQLObjectType = new GraphQLObjectType({
      name: 'Hello',
      fields: () => ({
        a: {
          type: graphQLObjectType,
        },
      }),
    });

    expect(buildObjectTypeArgumentString(graphQLObjectType)).toMatchInlineSnapshot(`
      "type GeneratedSDKArgumentsHello = {
        a: GeneratedSDKArgumentsHello;
      };"
    `);
  });
  it('primitive field with args.', () => {
    const graphQLObjectType = new GraphQLObjectType({
      name: 'Hello',
      fields: () => ({
        a: {
          type: GraphQLInt,
          args: {
            arg: {
              type: GraphQLInt,
            },
          },
        },
      }),
    });

    expect(buildObjectTypeArgumentString(graphQLObjectType)).toMatchInlineSnapshot(`
      "type GeneratedSDKArgumentsHello = {
        a: {} & {
          [SDKFieldArgumentSymbol]: {
            arg: \\"Int\\";
          }
        };
      };"
    `);
  });
});
