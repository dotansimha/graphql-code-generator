import { buildObjectTypeSelectionString } from './buildObjectTypeSelectionString';
import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';

describe('buildObjectTypeSelectionString', () => {
  it('primitive field', () => {
    const graphQLObjectType = new GraphQLObjectType({
      name: 'Hello',
      fields: {
        a: {
          type: GraphQLInt,
        },
      },
    });

    expect(buildObjectTypeSelectionString(graphQLObjectType)).toMatchInlineSnapshot(`
      "type GeneratedSDKSelectionSetHello = SDKSelectionSet<{
        __typename?: true;
        a?: true;
      }>;"
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

    expect(buildObjectTypeSelectionString(graphQLObjectType)).toMatchInlineSnapshot(`
      "type GeneratedSDKSelectionSetHello = SDKSelectionSet<{
        __typename?: true;
        a?: GeneratedSDKSelectionSetHello;
      }>;"
    `);
  });
  it('primitive field with optional arg.', () => {
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

    expect(buildObjectTypeSelectionString(graphQLObjectType)).toMatchInlineSnapshot(`
      "type GeneratedSDKSelectionSetHello = SDKSelectionSet<{
        __typename?: true;
        a?: true | SDKSelectionSet<{
          [SDKFieldArgumentSymbol]?: {
            arg?: string | never;
          }
        }>;
      }>;"
    `);
  });
  it('primitive field with required arg.', () => {
    const graphQLObjectType = new GraphQLObjectType({
      name: 'Hello',
      fields: () => ({
        a: {
          type: GraphQLInt,
          args: {
            arg: {
              type: new GraphQLNonNull(GraphQLInt),
            },
          },
        },
      }),
    });

    expect(buildObjectTypeSelectionString(graphQLObjectType)).toMatchInlineSnapshot(`
      "type GeneratedSDKSelectionSetHello = SDKSelectionSet<{
        __typename?: true;
        a?: SDKSelectionSet<{
          [SDKFieldArgumentSymbol]: {
            arg: string | never;
          }
        }>;
      }>;"
    `);
  });
});
