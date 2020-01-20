import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      foo: {
        type: GraphQLString,
        resolve: () => `FOO`,
      },
    },
  }),
});
