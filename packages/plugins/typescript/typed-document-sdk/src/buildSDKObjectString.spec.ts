import { GraphQLBoolean, GraphQLObjectType } from 'graphql';
import { buildSDKObjectString } from './buildSDKObjectString';

describe('buildSDKObjectString', () => {
  it('missing query type', () => {
    expect(() => {
      buildSDKObjectString(null, null, null);
    }).toThrow();
  });
  it('existing query type', () => {
    const objectType = new GraphQLObjectType({
      name: 'QueryRoot',
      fields: {
        a: {
          type: GraphQLBoolean,
        },
      },
    });
    expect(buildSDKObjectString(objectType, null, null)).toMatchInlineSnapshot(`
      "export const sdk = createSDK<
        SDKQueryRootSelectionSet,
        QueryRoot,
        void,
        void,
        void,
        void,
      >()"
    `);
  });
  it('existing query and mutation type', () => {
    const queryType = new GraphQLObjectType({
      name: 'QueryRoot',
      fields: {
        a: {
          type: GraphQLBoolean,
        },
      },
    });
    const mutationType = new GraphQLObjectType({
      name: 'MutationRoot',
      fields: {
        a: {
          type: GraphQLBoolean,
        },
      },
    });
    expect(buildSDKObjectString(queryType, mutationType, null)).toMatchInlineSnapshot(`
      "export const sdk = createSDK<
        SDKQueryRootSelectionSet,
        QueryRoot,
        SDKMutationRootSelectionSet,
        MutationRoot,
        void,
        void,
      >()"
    `);
  });
  it('existing query, mutation and subscription type', () => {
    const queryType = new GraphQLObjectType({
      name: 'QueryRoot',
      fields: {
        a: {
          type: GraphQLBoolean,
        },
      },
    });
    const mutationType = new GraphQLObjectType({
      name: 'MutationRoot',
      fields: {
        a: {
          type: GraphQLBoolean,
        },
      },
    });
    const subscriptionType = new GraphQLObjectType({
      name: 'Subscription',
      fields: {
        a: {
          type: GraphQLBoolean,
        },
      },
    });
    expect(buildSDKObjectString(queryType, mutationType, subscriptionType)).toMatchInlineSnapshot(`
      "export const sdk = createSDK<
        SDKQueryRootSelectionSet,
        QueryRoot,
        SDKMutationRootSelectionSet,
        MutationRoot,
        SDKSubscriptionSelectionSet,
        Subscription,
      >()"
    `);
  });
});
