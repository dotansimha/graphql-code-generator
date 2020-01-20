import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

export default new GraphQLSchema({
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
